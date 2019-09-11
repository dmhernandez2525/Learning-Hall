import React from "react";
import { Link } from "react-router-dom"//rf
import SubjectForm from "../subject/newSubjectComponent" ;
import CourseForm from "../course/courseContainer" ;
import TaskForm from "../task/taskformcomponent" ;


class Profile extends React.Component{
    constructor(props){
        super(props)
    }
    

    render(){

        let form;
        if ( this.props.currentTask === "Course")  form = <CourseForm/>
        if ( this.props.currentTask === "Subject")  form = <SubjectForm/>
        if ( this.props.currentTask === "Task")  form = <TaskForm/>


        return(

        <div>
                <div className="profile-user">
                <h3> Hello {this.props.currentUser.username} </h3>
                    <div className="profile-buttions">
                        <button onClick={() => this.props.receiveTask("Course")}> Make a Course</button>
                        <button onClick={() => this.props.receiveTask("Subject")}> Make a Subject</button>
                        <button onClick={() => this.props.receiveTask("Task")}> Make a Task</button>
                        <button onClick={() => this.props.signOut()}> Sign Out</button>
                    </div>
                </div>
            <div>
                {form}
            </div>
        </div>  
        )
    }
}

export default Profile