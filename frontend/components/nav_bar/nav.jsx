import React from "react"
import { Link } from "react-router-dom"



const NavBar = ({ currentUser, signOut, history }) => {
    let display;
    let logo;
    if (currentUser) display = (
        <div>
            <form onSubmit={e => e.preventDefault}>
                <p>Hello {currentUser.username}</p>
                <button onClick={() => signOut()}> Sign Out</button>
            </form>
        </div>
    )
    if ( history !== "/") display = (        
        <header className="nav-bar">
            <Link className="logo" to="/" ><img src="/assets/Screenshot from 2019-09-04 13-22-55.png" alt="Learning Hall Logo"></img></Link>
            {display}
        </header>
        )
    else{
        display = (
            <section className="hero">
                    <section>
                        <header className="main-top">
                            <Link className="main-logo" to="/" ><img src="/assets/Screenshot from 2019-09-04 13-22-55.png" alt="Learning Hall Logo"></img></Link>
                            <Link className="main-bottion-black" to="/signIn">logIn</Link>
                        </header>
                        <section className="hero-con">
                            <h1>Incres productivity and engament with your students -for free</h1>
                            <p>create a cores with the days and tasks maped out for your students.
                               get access to Learning halls corse creation tools for free</p>
                            <section>
                                <Link to="/signUp" className={"reg-buttion"}> get premium tools </Link> /////NEED TO CHANGE EVENTIALY
                                <div className="or"> or</div>
                                <Link to="/signUp" className={"reg-buttion"}> Continue with the free plan</Link>
                            </section>
                        </section>

                    </section>
                </section>
        )
    }
    
        
    // }
    // else if (history === "/signup" || history === "/signIn") display =  (
    //     <div>
    //         {/* <div className="g-signin2" data-onsuccess="onSignIn"></div> */}
    //     </div>
    //     ) 
    // else if (history === "/") display = (
    //         <div>
                
    //         </div>
    //     )
    // else display =
    //     // (<Link className="main-bottion-black" to="/signIn">logIn</Link>)

    return (
        <div>
            {display}
        </div>
    )


}


export default NavBar