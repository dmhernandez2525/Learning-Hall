import React from "react";

class CourseForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.course;
        this.handleNew = this.handleNew.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.allCourses = {}
        this.courseNames = [];
    };

    handleInput(type) {
        return (e) => {
            this.setState({ [type]: e.target.value });
        };
    };

    handleNew(event) {
        event.preventDefault();

        let newState = {
            name: this.state.name,
            author_id: this.state.author_id,
            id: this.state.id
        }
        debugger
        this.props.newCourse(newState)
    };

    handleEdit(event) {
        event.preventDefault();
        debugger
        let id = this.allCourses[this.state.courseName]
        let newCourse = {
            name: this.state.name,
            author_id: this.state.author_id,
            id
        }
        this.props.updateCourse(newCourse)
    };

    handleDelete(event) {
        event.preventDefault();
        let courseId = this.allCourses[this.state.courseName]
        this.props.deleteCourse(courseId)
    };


    render() {
        if (this.courseNames.length) {

        } else {
            let allCourseNames = this.props.allCourse.courses.map(course => {
                this.courseNames.push(<option value={course.name}>{course.name}</option>)
            })
        }


        this.props.allCourse.courses.forEach(course => {
            this.allCourses[course.name] = course.id
        })

        if (this.state.FormType === "Make a New Course") {
            return (
                <div className="sign_up_form">
                    <form className="course-form" onSubmit={this.handleNew}>
                        <h2 className="formH2">Make a New Course</h2>
                        <input
                            className="bigInputProfile"
                            type="text"
                            value={this.state.name}
                            placeholder="Course name"
                            onChange={this.handleInput("name")}
                        />

                        <div className="task-buttion-div">
                            <input className="bigButtionProfile" type="submit" value={"make a new Course"} />
                        </div>
                    </form>
                    <div className="task-buttion-div">
                        <input className="bigButtionProfile" type="submit" onClick={this.handleInput("FormType")} value={"Edit a Course"} />
                    </div>

                </div>
            )
        } else {
            return (
                <div className="sign_up_form">
                    <form className="course-form" onSubmit={this.handleEdit}>
                        <h2 className="formH2">Edit Course</h2>
                        <select className="bigSelectorProfile" value={this.state.courseName} onChange={this.handleInput('courseName')}>
                            <option defaultValue >Select the Course you would like to edit</option>
                            {this.courseNames}
                        </select>
                        <input
                            className="bigInputProfile"
                            type="text"
                            value={this.state.name}
                            placeholder="New Name"
                            onChange={this.handleInput("name")}
                        />
                        <div className="task-buttion-div">
                            <input className="bigButtionProfile" type="submit" value={"Edit Courses Name"} />
                            <input className="bigButtionProfile" type="submit" onClick={this.handleDelete} value={"Delete Course"} />
                        </div>
                    </form>
                    <div className="task-buttion-div">
                        <input className="bigButtionProfile" type="submit" onClick={this.handleInput("FormType")} value={"Make a New Course"} />
                    </div>
                </div>
            )
        }
    };
};



export default CourseForm;













