import React from "react"
import TaskLink from "../task/taskLink"



class SubjectLink extends React.Component {
    constructor(props) {
        super(props)
        this.subject = this.props.subject
        this.tasks = this.props.tasks
        this.handlClick = this.handlClick.bind(this)
    }
    
    handlClick() {
        let curent = document.getElementById(`${this.subject.name}+${this.subject.id}`)
        curent.classList.toggle("togle_subject")
    }

    render() {
        let MyTasks = this.tasks.map(task => {
            if (task.subject_id === this.subject.id) {
                return (
                    <ul key={`task.id${task.id}`} > 
                        <TaskLink task={task} receiveTask={this.props.receiveTask} />
                    </ul>
                )
            }

        })

        return (
            <ul key={`${this.subject.name}+${this.subject.id}`}>
                <button className="color-white-subjects-in-course" onClick={() => this.handlClick()}>
                    {this.subject.name}
                </button>
                <div className="togle_subject" id={`${this.subject.name}+${this.subject.id}`}>
                    <li>
                        {MyTasks}
                    </li>
                </div>
            </ul>
        )

    }

}

export default SubjectLink;