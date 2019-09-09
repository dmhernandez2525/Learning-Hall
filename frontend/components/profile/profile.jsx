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
            <h1>Profile Page</h1>
            <button><Link to="/">Go Back</Link></button>
            <div>
                <TaskForm/>

            </div>
        </div>  
        )
    }
}

export default Profile