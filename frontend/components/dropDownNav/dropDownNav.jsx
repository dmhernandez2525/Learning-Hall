import React from "react";
import CourseLink from "../course/courseLink"
import Loading from "../loading/loading"


class DropDownNav extends React.Component {
    constructor(props) {
        super(props)
    }
    componentDidMount() {
        this.props.allCourses()
        this.props.allSubjects()
        this.props.allTasks()

    }

    openCloseNav(){
        const stateNav = document.getElementById("mySidenav")
        let openNav = () => {

            document.getElementById("mySidenav").classList.remove("mySidenav")
            document.getElementById("mySidenav").classList.add("sidenav-togle")
            document.getElementById("Main").classList.remove("main-hall-as");
            document.getElementById("Main").classList.add("move");
        };

        let closeNav = () => {
            document.getElementById("mySidenav").classList.remove("sidenav-togle")
            document.getElementById("mySidenav").classList.add("sidenav")
            document.getElementById("Main").classList.add("main-hall-as");
            document.getElementById("Main").classList.remove("move");

        };
        if (stateNav.className === "sidenav") {
            openNav()
            
        } else {
            closeNav()
            
        }

    }


    render() {


        
        const courses = this.props.courses.map(course => (
            <CourseLink key={course.id} course={course} subjects={this.props.subjects} tasks={this.props.tasks} receiveTask={this.props.receiveTask} />)
        )

        // const subjects = this.props.subjects.map(subject => (
        //     <SubjectLink key={subject.id} subject={subject} />)
        // )

        // const tasks = this.props.tasks.map(task => (
        //     <TaskLink key={task.id} task={task} receiveTask={this.props.receiveTask} />)
        // )

        if (this.props.courses.length && this.props.subjects.length && this.props.tasks.length ) {
            
            document.body.classList.remove("background-loading")
            return (
                <div>
                    <div id="mySidenav" className="sidenav">
                            <section  className="nav-con-top">
                                <h5>cureent course</h5>
                                <div className="nav-buttion-sub">
                                    <h3>subject name</h3>
                                    <button>switch</button>
                                </div>
                            </section>
                        {/* <button className="closebtn" onClick={e => closeNav()}>&times</button> */}
                        <div className="drop-down">
                            

                            <section>
                                <div className="col"> {courses} </div>
                                {/* <div className="col"> {subjects} </div>  */}
                                {/* <div className="col"> {tasks} </div> */}
                            </section>

                        </div>
                    </div> 
                    {/* <div className="open_bar" onClick={e => openNav()}> <img src={window.handgerUrl} alt="Learning handger Logo"></img> Course Outline </div> */}
                    <div className="open_bar" onClick={e => this.openCloseNav()}> <img src={window.handgerUrl} alt="Learning handger Logo"></img> Course Outline </div>

                </div>
            ) 
        } else {
            document.body.classList.add("background-loading")

            return(

                <div>
                <Loading/>

                    <div id="mySidenav" className="sidenav">
            {/* {document.getElementById("mySidenav").style.backgroundColor = "gray"} */}
            
                        {/* <button className="closebtn" onClick={e => closeNav()}>&times</button> */}
                        <div className="drop-down " >

                            <section className="nav-con-top">
                                <h5>cureent course</h5>
                                <div className="nav-buttion-sub">
                                    <h3>subject name</h3>
                                    <button>switch</button>
                                </div>
                            </section>

                            <section>
                                {/* <div className="col"> {courses} </div>
                                <div className="col"> {subjects} </div>
                                <div className="col"> {tasks} </div> */}
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



