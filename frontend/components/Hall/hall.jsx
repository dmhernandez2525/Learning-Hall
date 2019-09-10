import React from "react";
import DropDown from "../dropDownNav/dropDownNavContainer";
import {Link} from "react-router-dom";
import { compiler } from 'markdown-to-jsx';
import Profile from "../profile/profile"
import Markdown from 'markdown-to-jsx';
// import css from '!!raw-loader!./a.md'

class Hall extends React.Component{
    constructor(props){
        super(props)
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
        if (this.props.currentTask === "no task") {
            text = <Profile/> 
        } else {
            // text = <Markdown>   </Markdown> 
            // text = (<div><Markdown> {this.props.currentTask.toString() }</Markdown></div>  )
            // text = (compiler('# Hello world!'))
            text = <div className="code-markDown">{compiler(this.props.currentTask.toString())}</div> 
        }




        return (
            <div id="Main" className="main-hall-as color1" > 
                <div>
                <nav className="the_nav">
                    <DropDown />

                    <header className="hall_nav" >
                        <section className="color2">
                            <button onClick={() => this.openCloseNav()}>Learn</button>
                            <button><Link to="/profile"> Profile </Link></button>
                            <button className="mentore">mentore</button>
                            <button><img src={window.slack} alt="slack logo"/> </button>
                            <button className="mentore">comunitty</button>
                        </section>
                    </header>
                </nav>

                <section className='main_task_part'>

                        <div className="main_task_part-first-div">
                        {/* <h1>{this.props.currentTask.name}</h1> */}
                        <div className="main-hall-task-text"> {text} </div>  
                    </div>

                    <section className="color3">
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
                    </div>
                    
                </section>
                </div>
            </div>
        )
    }

}

export default Hall