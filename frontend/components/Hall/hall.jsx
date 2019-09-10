import React from "react";
import DropDown from "../dropDownNav/dropDownNavContainer";
import {Link} from "react-router-dom";
import Markdown from 'markdown-to-jsx';
// import test from "./da"
import { compiler } from 'markdown-to-jsx';


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
            text = <div>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ut est vel neque malesuada lacinia. Donec id risus eget urna finibus malesuada. Sed mattis augue id ex sollicitudin, vel sagittis odio gravida. Vestibulum et metus odio. Maecenas auctor velit quam, ut gravida sapien pulvinar sit amet. Praesent sit amet rhoncus diam. Nunc elit urna, eleifend sed posuere ac, temp
                    Nam vel ex a libero auctor efficitur tempus ut dui. Sed consectetur ligula sed nisi ullamcorper, eu volutpat arcu dictum. Ut metus diam, tristique a tristique quis, sodales vitae odio. Fusce sagittis venenatis felis eget eleifend. Morbi vulputate ullamcorper massa, vitae semper turpis vestibulum a. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed nec aliquet lectus. Nam risus ex, viverra eget mauris facilisis, lobortis porta eros. Aenean molestie tellus a elit auctor congue et ut tortor. Fusce maximus dictum massa, at dapibus justo maximus id. Nulla lobortis arcu vitae mauris iaculis ornare. Aliquam purus orci, placerat sed vestibulum at, feugiat eu nisl. Vestibulum sed lacus ac sem tempor accumsan sit amet id justo. Cras nec mauris elementum, bibendum justo at, consectetur felis. Nu
                    Nulla efficitur ex neque, sit amet auctor arcu facilisis vitae. Pellentesque efficitur nisi ac metus cursus, et porttitor orci ornare. Praesent tellus purus, pharetra sed aliquet eget, aliquet et orci. Proin vehicula tincidunt dapibus. Aliquam vitae dapibus metus. Interdum et malesuada fames ac ante ipsum primis in faucibus. In nisi massa, facilisis eu nunc eu, consectetur bibendum dui. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aliquam commodo, metus vel elementum semper, urna erat euismod ex, ac dignissim purus sem ut tortor. Proin accumsan, felis non blandit rhoncus, dolor lacus volutpat neque, vitae cursus nisi ante nec lacus. Praesent nec erat ac nunc blandit condimentum. Duis pretium venenatis nibh eget mattis. Proin odio libero, ullamcorper consectetur feugiat vitae, aliquet sit amet nisl. Ut id viverra tellus, et elementum nibh. Sed fermentum metus ac sagi
                    Morbi vestibulum metus a magna dapibus, id porttitor lacus scelerisque. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur consectetur posuere consectetur. Ut consectetur sed urna sit amet volutpat. Nullam feugiat, ante in vehicula tempus, nisi nibh tristique lectus, nec elementum ex magna quis augue. Pellentesque vehicula ullamcorper lorem, eget tincidunt augue. Maecenas metus urna, ultricies quis viverra quis, pulvinar nec ligula. Integer tristique velit at dapibus vestibulum. Duis sit amet tortor convallis, elementum ante sit amet, sodales ante. Nullam eget augue ut mi cursus placerat nec quis nunc. Sed hendrerit lobortis leo vitae auctor. Cras non neque consequat, porttitor mauris eu, feugiat metus. Vivamus laoreet erat augue, eget pellentesque nulla consequat non. Proin libero massa, feugiat convallis lobortis sed, aliq
                    Donec vulputate eget lorem a suscipit. Nam ipsum neque, fringilla vitae egestas sed, molestie a turpis. Praesent ut metus nibh. Aenean non erat hendrerit, tristique sem quis, porttitor tortor. Morbi ultricies dolor sed magna lacinia, ac lobortis nibh ullamcorper. Nullam sit amet erat lectus. Ut malesuada lobortis purus sed porta.
                </p> 
            </div>
        } else {
            // text = <Markdown>   </Markdown> 
            // text = (<div><Markdown> {this.props.currentTask.toString() }</Markdown></div>  )
            // text = (compiler('# Hello world!'))
            text = <div>{compiler(this.props.currentTask.toString())}</div> 
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
                        <button>mentore</button>
                        <button><img src={window.slack} alt="slack logo"/> </button>
                        <button>comunitty</button>
                    </section>

                </header>
                </nav>

                <section className='main_task_part'>
                    <div>

                            <h1>{this.props.currentTask.name}</h1>
                            <div className="main-hall-task-text" >{text}</div>  







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

                            <h1>some text</h1>
                    </div>
                    
                </section>
                </div>
            </div>
        )
    }

}
export default Hall