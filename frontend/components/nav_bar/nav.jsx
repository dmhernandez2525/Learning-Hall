import React from "react"
import { Link } from "react-router-dom"



const NavBar = ({ currentUser, signOut, history }) => {


    let display;
    if (currentUser ) {
        if (history === "/") {
            return <div className="navBarDoNotUse">do not use</div>
        }

        else {
            display = (
            <div>
                <p>Hello {currentUser.username}</p>
                <button onClick={() => signOut()}> Sign Out</button>
            </div>
            )}

    }
    else if (history !== "/" ) return  (  
        <div className="auth-form-div">
            <header className="nav-bar">
                <Link className="logo" to="/" ><img src={window.logoUrl} alt="Learning Hall Logo"></img></Link>
                {display}
            </header>
        </div>
        )
    else{
        display = (
            <section className="hero">
                <header className="main-top">
                    <Link className="main-logo" to="/" ><img src={window.logoUrl} alt="Learning Hall Logo"></img></Link>
                    <Link className="main-bottion-black" to="/signIn">logIn</Link>
                </header>
                
                <section className="hero-con">
                    <h1>Increase productivity and engagement with your students -for free</h1>
                    <p>Create a course with the days and tasks mapped out for your students.
                        Get access to Learning halls corse creation tools for free</p>
                    <section>
                        <Link to="/signUp" className={"reg-buttion"}> get premium tools </Link>
                        <div className="or"> or</div>
                        <Link to="/signUp" className={"reg-buttion"}> Continue with the free plan</Link>
                    </section>
                </section>

                <p className="testimonial">I learned more real-world skills in 12 weeks than my Stanford degree taught me.</p>
                </section>
        )
    }


    return (
        
        <div >
            {display}
            
        </div>
    )


}


export default NavBar