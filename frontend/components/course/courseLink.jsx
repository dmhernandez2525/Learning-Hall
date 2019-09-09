import {Link} from "react-router-dom";
import React from "react"
import SubjectLink from "../subject/subjectLink"
import { runInThisContext } from "vm";


class CourseLink extends React.Component{
    constructor(props){
        super(props)
        this.course = this.props.course
        this.subjects = this.props.subjects
        this.tasks = this.props.tasks
        this.handlClick = this.handlClick.bind(this)
    } 
    handlClick(){
        let curent = document.getElementById(`${this.course.name}+${this.course.id}`)
        curent.classList.toggle("togle_course")
    }    
    
    render(){
        let Mysubjects = this.subjects.map(subject => {
            if (subject.courseId === this.course.id) {
                return (
                    <li><SubjectLink key={subject.id} subject={subject} tasks={this.tasks} receiveTask={this.props.receiveTask}  /></li>
                )
            } 

        })
        
        return (
            <div>
                <button onClick={() => this.handlClick()}>{this.course.name}</button>
                <div className=" togle_course" id={`${this.course.name}+${this.course.id}`}>
                    <ul>
                        {Mysubjects}
                    </ul>
                </div>
            </div>  
        )  
        

    }

}

export default CourseLink