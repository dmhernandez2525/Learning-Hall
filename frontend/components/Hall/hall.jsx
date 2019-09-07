import React from "react";
import CourseLink from "../course/courseLink"


class Hall extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.user
    }
    componentDidMount(){
        this.props.allCourses()
    }

    render(){
        const courses = this.props.courses.map(course => (
            <CourseLink key={course.id} course={course}  />)
        )
            
        return(
            <div>
                <h2>{`Welcome ${this.props.user.username} `}</h2>
            <h2>{`LET THE LEARNING BEGIN `}</h2>
                <ul>
                    {courses}
                </ul>

            </div>
        )
    }

}
export default Hall