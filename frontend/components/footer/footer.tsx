import React from "react";
import { Link } from "react-router-dom";

declare global {
  interface Window {
    logoUrl: string;
  }
}

const Footer: React.FC = () => (
  <footer className="footer">
    <Link className="logo" to="/">
      <img src={window.logoUrl} alt="Learning Hall Logo" />
    </Link>

    <div className="footer-div">
      <div className="nav-links">
        <h4>ABOUT</h4>
        <a href="https://brainydeveloper.com/">Portfolio</a>
        <a href="https://angel.co/daniel-hernandez-2525">Angel List</a>
        <a href="https://github.com/dmhernandez2525">Github</a>
      </div>
      <div className="nav-links">
        <h4>CONNECT</h4>
        <Link to="/signIn">Sign In</Link>
        <Link to="/signUp">Sign Up</Link>
        <Link to="/">Home</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
