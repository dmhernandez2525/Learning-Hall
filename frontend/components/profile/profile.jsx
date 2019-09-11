import React from "react";
import { Link } from "react-router-dom"
import TaskForm from "../task/taskformcomponent" ;


class Profile extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        debugger
        return(
        <div>
                <div className="profile-user">
                <h3> Hello {this.props.currentUser.username} </h3>
                    <div className="profile-buttions">
                        <button onClick={() => this.props.signOut()}> Sign Out</button>
                        <button > Make a Course</button>
                        <button > Make a Subject</button>
                        <button > Make a Task</button>
                    </div>
                </div>
            <div>
                <TaskForm/>
            </div>
        </div>  
        )
    }
}

export default Profile