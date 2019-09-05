import React from "react";
import {Link} from "react-router-dom"

const Footer = () => (
    <footer className="footer">
        <img className="footer-img" src="" alt=""/>
        <div className="nav-links">
            <Link to="/">About</Link>
            <Link to="/signIn">Sign In</Link>
            <Link to="/signUp">Sign Up</Link>
        </div>
    </footer>
)


export default Footer;