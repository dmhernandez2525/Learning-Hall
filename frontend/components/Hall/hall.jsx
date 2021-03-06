import React from "react";
import DropDown from "../dropDownNav/dropDownNavContainer";
import {Link} from "react-router-dom";
import { compiler } from 'markdown-to-jsx';
import Markdown from 'markdown-to-jsx';
import ProfileComponent from "../profile/profileComponent";
// import css from '!!raw-loader!./a.md'

class Hall extends React.Component{
    constructor(props){
        super(props)
        this.words = ["Course", "Subject", "Task", "no task","Profile" ]
    }

    openCloseNav() {
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

    render(){

        let text;
        let bottem;
        if ( this.words.includes(this.props.currentTask)  ) {
            text = <ProfileComponent /> 
        }
        else {
            // text = <Markdown>   </Markdown> 
            // text = (<div><Markdown> {this.props.currentTask.toString() }</Markdown></div>  )
            // text = (compiler('# Hello world!'))
            text = <div className="code-markDown">{compiler(this.props.currentTask.toString())}</div> 
            bottem = (
                <div>
                    <section className="all-most-don">
                        <h1 className="space">did you find this helpful?</h1>
                                <section className="color3">
                                <ul className="face-ul">
                                    <li className="face-li"><input type="checkbox" name="help" />
                                Yes

                                <div className="face">
                                        <span className="u-f-y">&#9786;</span>
                                </div>
                                </li>
                                    <div className="line"></div>

                                    <li className="face-li"><input type="checkbox" name="help" />

                                No
                                <div className="face">
                                        <span className="u-f">&#9785;</span>

                                </div>
                                </li>
                            </ul>
                        </section>
                    </section>
                    

                <div className="color4">
                    <div className="project_buttion">
                        <button className="big-buttion">subbmit project</button>
                        <button className="big-buttion">download project</button>
                    </div>

                    <h4> The project solution will be available after you submit </h4>
                </div>
                </div>

            )
        }




        return (
            <div id="Main" className="main-hall-as color1" > 
                <div>
                <nav className="the_nav">
                    <DropDown />

                    <header className="hall_nav" >
                        <section className="color2">
                            <button onClick={() => this.openCloseNav()}>Learn</button>
                            <button onClick={() => this.props.receiveTask("Profile")}>Profile</button>
                            {/* <button className="mentore">mentore</button> */}
                                {/* <button onClick={() => console.log("dddd")}> */}
                                <button onClick={() => console.log(window.open("https://join.slack.com/t/learninghall/shared_invite/enQtNzUzNzM0NDA1NzE2LTY1ZmFmNzY0NjFhOGVjZTBhMzg1M2RmYjJmOGRjNmYxOGM1OGJiOTIxNDY1NDZmMWE1Mzc3ZDE4ODM4OWNjYjk", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=10500,width=400,height=400, position=absolute")
)}>
                                    <img src={window.slack} alt="slack logo"/> </button>
                            {/* <button className="mentore">comunitty</button> */}
                        </section>
                    </header>
                </nav>

                <section className='main_task_part'>

                        <div className="main_task_part-first-div">
                        {/* <h1>{this.props.currentTask.name}</h1> */}
                        <div className="main-hall-task-text"> {text} </div>  
                    </div>

                    {/* <section className="color3">
                            <h1>did u find this helpfull?</h1>
                            <ul>
                                <li><input type="checkbox" name="help"/> Yes</li>
                                <li><input type="checkbox" name="help"/> No </li>
                            </ul>
                    </section>

                    <div className="color4">
                        <div className="project_buttion">
                            <button>subbmit project</button>
                            <button>download project</button>         
                        </div>

                            <h4> The project solution will be available after you submit </h4>
                    </div> */}
                    {/* {bottem} */}
                    
                </section>
                </div>
            </div>
        )
    }

}

export default Hall