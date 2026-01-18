# Competitive Research Prompt: Learning-Hall

## Instructions for Research Agent

You are conducting competitive research to build a comprehensive feature backlog for **Learning-Hall**, an online learning and education platform. Your goal is to identify 200-500+ features by analyzing competitors and industry best practices.

---

## Project Overview

**Learning-Hall** is a full-stack learning management system (LMS) that helps:
- Students access courses and educational content
- Instructors create and manage courses
- Track learning progress and achievements
- Provide interactive learning experiences

**Current Tech Stack:**
- Frontend: React (upgrading to 19.x)
- Backend: Ruby on Rails (upgrading to 7.2)
- Database: PostgreSQL
- State: Redux
- Storage: AWS S3

---

## Research Categories

Analyze competitors and identify features in these categories:

### 1. Course Discovery & Catalog
- Course search and filtering
- Category/topic organization
- Skill level indicators
- Course recommendations
- Learning paths/tracks
- Course previews

### 2. Course Content & Delivery
- Video lessons with streaming
- Interactive quizzes and assessments
- Downloadable resources
- Code exercises (for tech courses)
- Live sessions/webinars
- Offline access

### 3. Progress Tracking
- Lesson completion tracking
- Progress dashboards
- Learning streaks/gamification
- Time spent analytics
- Skill proficiency tracking
- Goal setting

### 4. Assessments & Certification
- Quiz builder
- Assignment submission
- Peer review
- Grading systems
- Certificate generation
- Badge/credential systems

### 5. Instructor Tools
- Course creation wizard
- Content management
- Student analytics
- Revenue/earnings dashboard
- Communication tools
- Course pricing options

### 6. Student Features
- Notes and bookmarks
- Course wishlist
- Learning history
- Discussion participation
- Study groups
- Mobile learning

### 7. Community & Social
- Discussion forums
- Q&A sections
- Student profiles
- Instructor messaging
- Study groups
- Course reviews/ratings

### 8. Gamification
- Points and XP systems
- Badges and achievements
- Leaderboards
- Learning challenges
- Streak rewards
- Level progression

### 9. Enterprise/B2B Features
- Team management
- Custom learning paths
- Compliance tracking
- Reporting and analytics
- SSO integration
- White-label options

### 10. Integrations
- Calendar sync
- Payment processors
- Video conferencing (Zoom, etc.)
- Slack/Teams notifications
- LTI compliance
- SCORM support

---

## Competitors to Analyze

### Primary Competitors (Major Platforms)
1. **Udemy** - Marketplace model, huge catalog
2. **Coursera** - University partnerships
3. **edX** - MIT/Harvard founded
4. **Skillshare** - Creative skills focus
5. **LinkedIn Learning** - Professional development

### Self-Paced Learning
6. **Pluralsight** - Tech skills platform
7. **Codecademy** - Interactive coding
8. **DataCamp** - Data science focus
9. **Khan Academy** - Free education
10. **Brilliant** - STEM learning

### Course Platforms (Creator Tools)
11. **Teachable** - Course creation platform
12. **Thinkific** - Course hosting
13. **Kajabi** - All-in-one creator platform
14. **Podia** - Digital products
15. **LearnWorlds** - Interactive courses

### Enterprise LMS
16. **Docebo** - Corporate LMS
17. **Cornerstone** - Enterprise learning
18. **TalentLMS** - SMB LMS
19. **Moodle** - Open source LMS
20. **Canvas** - Education LMS

---

## Output Format

Provide your research in this format:

### Feature Backlog Structure

```markdown
## Category X: [Category Name] (X features)

### P0 - Critical (MVP Required)
| ID | Feature | Description | Effort | Competitors |
|----|---------|-------------|--------|-------------|
| FX.X.X | Feature Name | What it does | Low/Med/High | Udemy, Coursera |

### P1 - High Priority (Competitive Parity)
[Same table format]

### P2 - Medium Priority (Differentiation)
[Same table format]

### P3 - Future (Nice to Have)
[Same table format]
```

### Priority Definitions
- **P0 Critical**: Core features needed for MVP launch
- **P1 High**: Features that major competitors all have
- **P2 Medium**: Features that differentiate from competitors
- **P3 Future**: Advanced features for long-term roadmap

### Effort Definitions
- **Low**: 1-2 days implementation
- **Medium**: 3-5 days implementation
- **High**: 1-2 weeks implementation

---

## Research Questions to Answer

1. What features do ALL major learning platforms have? (P0/P1 candidates)
2. What makes Udemy/Coursera successful? What can we learn?
3. What do instructors complain about on existing platforms?
4. What do students want that platforms don't provide?
5. What gamification features drive engagement?
6. How are platforms using AI for personalized learning?
7. What mobile features are essential?
8. What accessibility/a11y features are required?
9. What enterprise features are needed for B2B?
10. What content formats are trending (video, interactive, etc.)?

---

## Expected Deliverable

A comprehensive FEATURE_BACKLOG.md file with:
- 200-500 features organized by category
- Priority levels (P0-P3) for each feature
- Effort estimates
- Competitor references
- Phase recommendations (which quarter to build)

Reference the SpecTree FEATURE_BACKLOG.md format for structure inspiration.
