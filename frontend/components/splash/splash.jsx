import React from "react";
import { Link } from "react-router-dom";

// debugger
class Splash extends React.Component{
    constructor(props){
        super(props)
    }


    render(){
        return(
            <div className="splash">
                <h1>THIS IS THE SPLASH PAGE</h1>
                <br/>
                <Link className="buttion" to="/signup"> Sign Up</Link>
            </div>
        )
    }
}


export default Splash 