import React from "react";
import SubjectLink from "../subject/subjectLink"
import CourseLink from "../course/courseLink"
import TaskLink from "../task/taskLink"
import Loading from "../loading/loading"


class DropDownNav extends React.Component {
    constructor(props) {
        super(props)
    }
    componentDidMount() {
        s
        this.props.allCourses()
        this.props.allSubjects()
        this.props.allTasks()
    }

    render() {
        let openNav = () => (

            document.getElementById("mySidenav").style.width = "250px"

        );

        let closeNav = () => (

            document.getElementById("mySidenav").style.width = "0"

        );
        
        const courses = this.props.courses.map(course => (
            <CourseLink key={course.id} course={course} />)
        )

        const subjects = this.props.subjects.map(subject => (
            <SubjectLink key={subject.id} subject={subject} />)
        )

        const tasks = this.props.tasks.map(task => (
            <TaskLink key={task.id} task={task} />)
        )

        if (this.props.courses.length && this.props.subjects.length && this.props.tasks.length ) {
            return (
                <div>
                    <div id="mySidenav" className="sidenav">
                        <a href="javascript:void(0)" className="closebtn" onClick={e => closeNav()}>&times;</a>
                        <div className="drop-down">
                            <div className="col"> {courses} </div>
                            <div className="col"> {subjects} </div>
                            <div className="col"> {tasks} </div>
                        </div>
                    </div>
                    <div onClick={e => openNav()}> open </div>
                </div>
            ) 
        } else {
            return <Loading/>
        } 

    }

}
export default DropDownNav