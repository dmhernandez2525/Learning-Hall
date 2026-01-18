import React from "react"



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
        let a;
        if(this.task.completed === true){
            a = <span>&#10003;</span>
        }else{
            a = <span>&#10007;</span>

        }
            return(
        <li className="nav-back_blue">
                    <button className="color-green-subjects-in-course" onClick={() => this.handleClick()}>
                        <span className="task-check-span">
                          {a}
                        <span>{this.task.name}</span>                          
                        </span>

                        <time>{this.task.duration}</time>
                        
                    </button> 
            <h1 className="task-body" id={this.task.id}> {this.task.body}</h1>
        </li>
    )
    }


}
export default TaskLink