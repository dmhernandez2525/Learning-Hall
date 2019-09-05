import React from "react";
import {Link} from "react-router-dom"

const Footer = () => (
    <div className="footer">
        <img className="footer-img" src="" alt=""/>
        <div className="nav-links">
            <Link to="/"></Link>
            <Link to="/signIn">Sign In</Link>
            <Link to="/signUp">Sign Up</Link>
        </div>
    </div>
)


export default Footer;