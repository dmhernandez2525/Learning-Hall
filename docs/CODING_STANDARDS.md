# Learning Hall - Coding Standards

**Version:** 1.0.0
**Last Updated:** January 2026

---

## General Principles

1. **Readability First**: Code should be self-documenting
2. **Consistency**: Follow established patterns in the codebase
3. **Simplicity**: Prefer simple solutions over clever ones
4. **DRY**: Don't Repeat Yourself, but avoid premature abstraction

---

## Ruby/Rails Backend

### Formatting
- Use 2-space indentation
- Maximum line length: 100 characters
- Use Ruby 2.5+ syntax features appropriately

### Naming Conventions
```ruby
# Variables and methods: snake_case
current_user = User.find(id)
def calculate_progress
end

# Classes and modules: PascalCase
class CourseController < ApplicationController
end

# Constants: UPPER_SNAKE_CASE
MAX_UPLOAD_SIZE = 10.megabytes

# Predicates: end with ?
def enrolled?
end
```

### Controllers
```ruby
# Keep controllers thin
class CoursesController < ApplicationController
  before_action :require_login

  def show
    @course = Course.find(params[:id])
    render :show
  end

  private

  def course_params
    params.require(:course).permit(:title, :description)
  end
end
```

### Models
```ruby
class Course < ApplicationRecord
  # 1. Constants
  STATUSES = %w[draft published archived].freeze

  # 2. Associations
  belongs_to :instructor, class_name: 'User'
  has_many :subjects, dependent: :destroy
  has_many :enrollments
  has_many :students, through: :enrollments, source: :user

  # 3. Validations
  validates :title, presence: true, length: { maximum: 200 }
  validates :status, inclusion: { in: STATUSES }

  # 4. Scopes
  scope :published, -> { where(status: 'published') }
  scope :recent, -> { order(created_at: :desc) }

  # 5. Callbacks (use sparingly)
  after_create :notify_admin

  # 6. Instance methods
  def publish!
    update!(status: 'published')
  end

  private

  def notify_admin
    AdminMailer.new_course(self).deliver_later
  end
end
```

---

## JavaScript/React Frontend

### Formatting
- Use 2-space indentation
- Use semicolons
- Use single quotes for strings
- Maximum line length: 100 characters

### Naming Conventions
```javascript
// Variables and functions: camelCase
const currentUser = store.getState().session.user;
function fetchCourses() {}

// Components: PascalCase
function CourseCard({ course }) {}

// Constants: UPPER_SNAKE_CASE
const RECEIVE_COURSES = 'RECEIVE_COURSES';

// Action types: VERB_NOUN format
const RECEIVE_COURSE = 'RECEIVE_COURSE';
const REMOVE_COURSE = 'REMOVE_COURSE';
```

### React Components
```jsx
// 1. Imports
import React from 'react';
import { connect } from 'react-redux';

// 2. Component definition
function CourseCard({ course, onEnroll }) {
  // 3. Event handlers
  const handleEnroll = () => {
    onEnroll(course.id);
  };

  // 4. Render
  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <button onClick={handleEnroll}>Enroll</button>
    </div>
  );
}

// 5. Redux connection
const mapStateToProps = (state) => ({
  // ...
});

const mapDispatchToProps = (dispatch) => ({
  // ...
});

// 6. Export
export default connect(mapStateToProps, mapDispatchToProps)(CourseCard);
```

### Redux Actions
```javascript
// Action creators
export const receiveCourses = (courses) => ({
  type: RECEIVE_COURSES,
  courses,
});

// Thunk actions
export const fetchCourses = () => async (dispatch) => {
  const response = await fetch('/api/courses');
  const courses = await response.json();
  dispatch(receiveCourses(courses));
};
```

### Redux Reducers
```javascript
const initialState = {
  byId: {},
  allIds: [],
};

const coursesReducer = (state = initialState, action) => {
  switch (action.type) {
    case RECEIVE_COURSES:
      return {
        ...state,
        byId: action.courses.reduce((acc, course) => {
          acc[course.id] = course;
          return acc;
        }, {}),
        allIds: action.courses.map((c) => c.id),
      };
    default:
      return state;
  }
};
```

---

## API Design

### RESTful Conventions
```
GET    /api/courses          # index
POST   /api/courses          # create
GET    /api/courses/:id      # show
PATCH  /api/courses/:id      # update
DELETE /api/courses/:id      # destroy
```

### JSON Response Format
```json
{
  "id": 1,
  "title": "Ruby on Rails",
  "description": "Learn Rails",
  "instructor": {
    "id": 1,
    "name": "John Doe"
  },
  "subjects": [
    { "id": 1, "title": "Introduction" }
  ]
}
```

---

## Testing

### Rails Tests
```ruby
class CourseTest < ActiveSupport::TestCase
  test "should require title" do
    course = Course.new(description: "Test")
    assert_not course.valid?
    assert_includes course.errors[:title], "can't be blank"
  end
end
```

### Controller Tests
```ruby
class CoursesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get courses_url
    assert_response :success
  end
end
```

---

## Git Commit Messages

Follow conventional commits:
```
feat: add course progress tracking
fix: resolve enrollment validation error
docs: update API documentation
test: add unit tests for Course model
refactor: extract progress calculation to service
chore: update gems
```
