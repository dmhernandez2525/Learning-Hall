import React from "react";
import {Link} from "react-router-dom"

const Footer = () => (
    <footer className="footer">
        
        <Link className="logo" to="/" ><img src={window.logoUrl} alt="Learning Hall Logo"></img></Link>        

        <div className="footer-div">
            
            <div className="nav-links">
                <h4>COMPANY</h4>
                    <Link to="/">About</Link>
                    
                    <Link to="/signIn">Sign In</Link>

                    <Link to="/signUp">Sign Up</Link>

                </div>
                <div className="nav-links">
                    <h4>PROGRAMS</h4>

                    <Link to="/">About</Link>
                    <Link to="/signIn">Sign In</Link>
                    <Link to="/signUp">Sign Up</Link>
                </div>
                <div className="nav-links">
                    <h4>CONNECT</h4>
                    <Link to="/">About</Link>
                    <Link to="/signIn">Sign In</Link>
                    <Link to="/signUp">Sign Up</Link>
                </div>
        </div>
 
    </footer>
)


export default Footer;