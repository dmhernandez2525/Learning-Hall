import React from "react";
import SubjectLink from "../subject/subjectLink"
import CourseLink from "../course/courseLink"
import TaskLink from "../task/taskLink"


class DropDownNav extends React.Component {
    constructor(props) {
        super(props)
    }
    componentDidMount() {
        this.props.allCourses()
        this.props.allSubjects()
        this.props.allTasks()
    }

    render() {

        const courses = this.props.courses.map(course => (
            <CourseLink key={course.id} course={course} />)
        )

        const subjects = this.props.subjects.map(subject => (
            <SubjectLink key={subject.id} subject={subject} />)
        )
        const tasks = this.props.tasks.map(task => (
            <TaskLink key={task.id} task={task} />)
        )

        return (
            <div>
                <div className="drop-down">
                    <div className="col"> {courses} </div>
                    <div className="col"> {subjects} </div>
                    <div className="col"> {tasks} </div>
                </div>


            </div>
        )
    }

}
export default DropDownNav