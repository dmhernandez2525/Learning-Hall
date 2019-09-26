import React from "react";
import CourseLink from "../course/courseLink"
import Loading from "../loading/loading"
import {Link} from "react-router-dom"


class DropDownNav extends React.Component {
    constructor(props) {
        super(props)
        this.handlClick = this.handlClick.bind(this)
        this.handleClickSwitch = this.handleClickSwitch.bind(this)
    }

    componentDidMount() {
        this.props.allCourses()
        this.props.allSubjects()
        this.props.allTasks()

    }
    handlClick() {
        // let curent = document.getElementById(`${this.course.name}+${this.course.id}`)
        
        curent.classList.toggle("togle_course")
    }   

    handleClickSwitch(){
        let all = document.getElementById("allCourses")
        all.classList.toggle("switch-off")
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


        
        let CourseToDisplay;
        let courseToDisplayName;
        let CurrentCourse = this.props.CurrentCourse 
        if (CurrentCourse === "no Course"){
            courseToDisplayName = "plz pick a course"
        }else{
            courseToDisplayName = CurrentCourse.name;
            CourseToDisplay = (
                <CourseLink 
                    key={CurrentCourse.id} 
                    course={CurrentCourse} 
                    subjects={this.props.subjects} 
                    tasks={this.props.tasks} 
                    receiveTask={this.props.receiveTask} 
                />
            )
        }
        // const courses = this.props.courses.map(course => (
        //     <CourseLink 
        //         key={course.id} 
        //         course={course} 
        //         subjects={this.props.subjects} 
        //         tasks={this.props.tasks} 
        //         receiveTask={this.props.receiveTask} 
        //     />
        //     )
        // )
         const courses = this.props.courses.map(course => {
            return (<li>
                {/* key={course.id}  */}
                {/* <button onClick={() => this.handlClick()}>{course.name}</button> */}
                <Link onClick={() => this.props.receiveCourse(course)}>{course.name}</Link>
            
                {/* {course.name}  */}
            </li>)
            }
        )


        if (this.props.courses.length && this.props.subjects.length && this.props.tasks.length ) {

            document.body.classList.remove("background-loading")
            return (
                <div>
                    <div id="mySidenav" className="sidenav">
                            <section  className="nav-con-top">
                                <h5>curent course</h5>
                                <div className="nav-buttion-sub">
                                <h3>{courseToDisplayName}</h3>
                                    <button onClick={() => this.handleClickSwitch()}>switch</button>
                                
                                </div>
                            </section>
                        <div className="drop-down">
                                {/* <div className="col">  */}
                                    <ul id="allCourses" className="switch-on ">{courses} </ul> 
                                {/* </div> */}


            
                                {CourseToDisplay}
                            
                            {/* <div className="col">
                                {CourseToDisplay}
                            </div> */}

                        </div>
                    </div> 

                    <div className="open_bar" onClick={e => this.openCloseNav()}> 
                        <img src={window.handgerUrl} 
                            alt="Course outline open nav buttion">
                        </img> 
                        <h1 className="Course-Outline">Course Outline</h1> 
                    </div>

                </div>
            ) 
        } else {
            document.body.classList.add("background-loading")

            return(
                
                <div>
                <Loading/>
                    <div id="mySidenav" className="sidenav">
                        <div className="drop-down " >

                        </div>
                    </div>
                    <div className="open_bar"> <img src={window.handgerUrl}></img> Course Outline </div>
                </div>

            );

        }; 

    };

};
export default DropDownNav



