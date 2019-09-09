import React from "react"
import { runInThisContext } from "vm";



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
    // const body = this.task.body
        // const task = document.getElementById("main-text-one")
        // task.classList.toggle("task-body")
        // task.innerHTML = body
        // task.dangerouslySetInnerHTML = this.createMarkup() 

        this.props.receiveTask(this.task.body)  
    }



    render(){
            return(
        <div>
            <button onClick={() => this.handleClick()}>{this.task.name}</button> 
            <h1 className="task-body" id={this.task.id}> {this.task.body}</h1>
        </div>
    )
    }


}
export default TaskLink