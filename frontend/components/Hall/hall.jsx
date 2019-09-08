import React from "react";
import SubjectLink from "../subject/subjectLink"
import CourseLink from "../course/courseLink"


class Hall extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.user
    }
    componentDidMount(){
        this.props.allCourses()
        debugger
        this.props.allSubjects()
    }

    render(){

        const courses = this.props.courses.map(course => (
            <CourseLink key={course.id} course={course}  />)
        )

        const subjects = this.props.subjects.map(subject => (
            <SubjectLink key={subject.id} subject={subject}  />)
        )
            
        return(
            <div>
                <h2>{`Welcome ${this.props.user.username} `}</h2>
            <h2>{`LET THE LEARNING BEGIN `}</h2>
                <ul>
                    {courses}
                    {subjects}
                </ul>

            </div>
        )
    }

}
export default Hall