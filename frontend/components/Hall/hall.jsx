import React from "react";
import DropDown from "../dropDownNav/dropDownNavContainer"


class Hall extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.user
    }

    render(){

            
        return(
            <div>
                {/* <h2>{`Welcome ${this.props.user.username} `}</h2>
            <h2>{`LET THE LEARNING BEGIN `}</h2> */}
                <nav>
                    <DropDown />
                </nav>
                <header className="hall_nav">
{/* 
                        <ul></ul>
                        <h2>somthing soon</h2>
                        <ul>
                            <li>
                                <h1>links</h1>
                                <a href="1"></a>
                            </li>
                            <h2>name of task</h2> */}
                            {/* <ul> */}
                                <button>Learn</button>
                                <button>Profile</button>
                                <button>mentore</button>
                                <button>slack</button>
                                <button>comunitty</button>
                            {/* </ul>
                        </ul> */}

                </header>
                <section className='main_task_part'>
                    <h1>LOAD THE TASK IN HERE</h1>
                    <section>
                        <h1>did u find this helpfull?</h1>
                        <ul>
                                <li type="checkbox" >yes</li>
                                <li type="checkbox" >no</li>
                        </ul>
                    </section>
                    <div>
                        <button>subbmit project</button>
                        <button>download project</button>
                        <h1>some text</h1>
                    </div>
                </section>
            </div>
        )
    }

}
export default Hall