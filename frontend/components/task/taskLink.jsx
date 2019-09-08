import React from "react"



class TaskLink extends React.Component{
    constructor(props){
        super(props)
        this.handleClick = this.handleClick.bind(this)
        this.task = this.props.task
    }
    handleClick(){
        const task = document.getElementById([this.task.id])
        task.classList.toggle("task-body")
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