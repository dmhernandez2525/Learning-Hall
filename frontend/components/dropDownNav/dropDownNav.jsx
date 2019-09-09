import React from "react";
import SubjectLink from "../subject/subjectLink"
import CourseLink from "../course/courseLink"
import TaskLink from "../task/taskLink"
import Loading from "../loading/loading"


class DropDownNav extends React.Component {
    constructor(props) {
        super(props)
    }
    componentDidMount() {
        this.props.allCourses()
        this.props.allSubjects()
        this.props.allTasks()
        // add a sleep in app/controllers/api/tasks_controller.rb
        //on line 4

    }
    // async down(){
       
    //     this.props.allCourses()
    //     this.props.allSubjects()
    //     this.props.allTasks()
    //     await sleep(3);
    // }

    render() {
        let openNav = () => {

            document.getElementById("mySidenav").style.width = "250px";
            document.getElementById("Main").classList.remove("main-hall-as");
            document.getElementById("Main").classList.add("move");
        };

        let closeNav = () => {

            document.getElementById("mySidenav").style.width = "0"
            document.getElementById("Main").classList.add("main-hall-as");
            document.getElementById("Main").classList.remove("move");

        };
        
        const courses = this.props.courses.map(course => (
            <CourseLink key={course.id} course={course} />)
        )

        const subjects = this.props.subjects.map(subject => (
            <SubjectLink key={subject.id} subject={subject} />)
        )

        const tasks = this.props.tasks.map(task => (
            <TaskLink key={task.id} task={task} receiveTask={this.props.receiveTask} />)
        )

        if (this.props.courses.length && this.props.subjects.length && this.props.tasks.length ) {
            
            document.body.classList.remove("background-loading")
            return (
                <div>
                    <div id="mySidenav" className="sidenav">
                        <a href="javascript:void(0)" className="closebtn" onClick={e => closeNav()}>&times;</a>
                        <div className="drop-down">
                            
                            <section>
                                <h5>cureent course</h5>
                                <div>
                                    <h3>subject name</h3>
                                    <button>switch</button>
                                </div>
                            </section>

                            <section>
                                <div className="col"> {courses} </div>
                                <div className="col"> {subjects} </div>
                                <div className="col"> {tasks} </div>
                            </section>

                        </div>
                    </div> 
                    <div className="open_bar" onClick={e => openNav()}> <img src={window.handgerUrl} alt="Learning handger Logo"></img> Course Outline </div>

                </div>
            ) 
        } else {
            document.body.classList.add("background-loading")

            return(

                <div>
                <Loading/>

                    <div id="mySidenav" className="sidenav">
            {/* {document.getElementById("mySidenav").style.backgroundColor = "gray"} */}
            
                        <a href="javascript:void(0)" className="closebtn" onClick={e => closeNav()}>&times;</a>
                        <div className="drop-down " >

                            <section>
                                <h5>cureent course</h5>
                                <div>
                                    <h3>subject name</h3>
                                    <button>switch</button>
                                </div>
                            </section>

                            <section>
                                <div className="col"> {courses} </div>
                                <div className="col"> {subjects} </div>
                                <div className="col"> {tasks} </div>
                            </section>

                        </div>
                    </div>
                    <div className="open_bar" onClick={e => openNav()}> <img src={window.handgerUrl} alt="Learning handger Logo"></img> Course Outline </div>

                </div>

            )

        } 

    }

}
export default DropDownNav



