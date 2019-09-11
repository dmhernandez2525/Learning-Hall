import React from "react";
import { Link } from "react-router-dom"
import TaskForm from "../task/taskformcomponent" ;


class Profile extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        return(
        <div>
                <h1> Hello {currentUser.username} </h1>
                <div>
                    <button onClick={() => signOut()}> Sign Out</button>
                </div>
            <div>
                <TaskForm/>
            </div>
        </div>  
        )
    }
}

export default Profile