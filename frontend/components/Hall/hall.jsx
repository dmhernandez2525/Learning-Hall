import React from "react";


class Hall extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.user
    }
    componentDidMount(){
        this.props.allCourses()
    }

    render(){
        debugger
        const courses = this.props.courses.map(course => (
            <li> {course.id} {course.name} </li>)
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