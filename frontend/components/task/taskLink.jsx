import React from "react"
import { runInThisContext } from "vm"; //rf



class TaskLink extends React.Component{
    constructor(props){
        super(props)
        this.handleClick = this.handleClick.bind(this)
        this.task = this.props.task
        this.createMarkup = this.createMarkup.bind(this)
    }
    
    createMarkup() {
        return { __html: [this.task.body] };
    }
    
 
    handleClick(){
        this.props.receiveTask(this.task.body)  
    }



    render(){
            return(
        <li>
            <button className="color-green-subjects-in-course" onClick={() => this.handleClick()}>{this.task.name}</button> 
            <h1 className="task-body" id={this.task.id}> {this.task.body}</h1>
        </li>
    )
    }


}
export default TaskLink