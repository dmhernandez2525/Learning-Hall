import React from "react"
import TaskLink from "../task/taskLink"

import {Link} from "react-router-dom"

class SubjectLink extends React.Component {
    constructor(props) {
        super(props)
        this.subject = this.props.subject
        this.tasks = this.props.tasks
        this.handlClick = this.handlClick.bind(this)
        this.allTaskTime = 0;
        this.tasktimeLeft = 0;
        this.allTaskCount = 0;
        this.taskCountLeft = 0;
    }
    
    handlClick() {
        let curent = document.getElementById(`${this.subject.name}+${this.subject.id}`)
        curent.classList.toggle("togle_subject")
        let curentCir = document.getElementById(`${ this.subject.id }cir`)
        curentCir.classList.toggle("cir-nav-click")
    }

    render() {

        let MyTasks = this.tasks.map(task => {


            if (task.subject_id === this.subject.id) {

                this.allTaskTime = this.allTaskTime + task.duration

                // this.tasktimeLeft = this.tasktimeLeft + task.duration

                this.allTaskCount = this.allTaskCount + 1

                // this.taskCountLeft = this.taskCountLeft + 1
                debugger

                if (task.completed) {
                    // this.allTaskTime = this.allTaskTime - task.duration

                    this.taskCountLeft = this.taskCountLeft + 1
                    
                    this.tasktimeLeft = this.tasktimeLeft + task.duration
                } 

                return (
                    <ul key={`task.id${task.id}`} > 
                        <TaskLink task={task} receiveTask={this.props.receiveTask} />
                    </ul>
                )
            }

        })
        // let timeDiv = (`${taskimeLeft} / ${allTaskTime} `)
        // let timeCom = (`${taskCountLeft} / ${allTaskCount} `)

        return (
            <li key={`${this.subject.name}+${this.subject.id}`}>
                <button to={this.subject.id} className="color-white-subjects-in-course" onClick={() => this.handlClick()}>

                    <div className="cir-nav">
                        <div id={`${this.subject.id}cir`} >

                        </div>
                    </div>

                    <div className="sub-div">
                        <div>{this.subject.name}</div>
                        <div className="sub-sub-div">{`Duration ${this.tasktimeLeft} / ${this.allTaskTime} `}</div>
                        <div className="sub-sub-div"> {`Task Count ${this.taskCountLeft} / ${this.allTaskCount} `}</div>
                        
                        
                       
                        
                    </div>

                </button>
                <div className="togle_subject" id={`${this.subject.name}+${this.subject.id}`}>
                    <li>
                        {MyTasks}
                    </li>
                </div>
            </li>
        )

    }

}

export default SubjectLink;