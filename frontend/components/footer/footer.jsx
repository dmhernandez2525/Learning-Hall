import React from "react";
import {Link} from "react-router-dom"

const Footer = () => (
    <footer className="footer">
        <Link className="logo" to="/" ><img src="/assets/Screenshot from 2019-09-04 13-22-55.png" alt="Learning Hall Logo"></img></Link>        
    
        <div className="nav-links">
            <Link to="/">About</Link>
            <Link to="/signIn">Sign In</Link>
            <Link to="/signUp">Sign Up</Link>
        </div>
        <div className="nav-links">
            <Link to="/">About</Link>
            <Link to="/signIn">Sign In</Link>
            <Link to="/signUp">Sign Up</Link>
        </div>
        <div className="nav-links">
            <Link to="/">About</Link>
            <Link to="/signIn">Sign In</Link>
            <Link to="/signUp">Sign Up</Link>
        </div>
    </footer>
)


export default Footer;