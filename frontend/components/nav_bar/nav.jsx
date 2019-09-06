import React from "react"
import { Link } from "react-router-dom"



const NavBar = ({ currentUser, signOut, history }) => {






    
    let openNav = ()  => (

        document.getElementById("mySidenav").style.width = "250px"
    
        );

    let closeNav = ()  => (

        document.getElementById("mySidenav").style.width = "0"
    
        );









    let display;
    let logo;
    if (currentUser) display = (
        <div>
            <form onSubmit={e => e.preventDefault}>
                <p>Hello {currentUser.username}</p>
                <button onClick={() => signOut()}> Sign Out</button>







                {/* here */}

                <div id="mySidenav" className="sidenav">

                    {/* <a href="javascript:void(0)" className="closebtn" onClick={e => openNav()}>&times;</a> */}
                    <Link to="/"> About </Link>
                    <Link to="/"> Services </Link>
                    <Link to="/"> Clients </Link>
                    <Link to="/"> Contact </Link>
                </div>
                
                <div  onClick={e => openNav()}> open </div>

                {/* here */}








            </form>
        </div>
    )
    else if ( history !== "/") display = (        
        <header className="nav-bar">
            <Link className="logo" to="/" ><img src="/assets/Screenshot from 2019-09-04 13-22-55.png" alt="Learning Hall Logo"></img></Link>
            {display}
        </header>
        )
    else{
        display = (
            <section className="hero">
                <header className="main-top">
                    <Link className="main-logo" to="/" ><img src="/assets/Screenshot from 2019-09-04 13-22-55.png" alt="Learning Hall Logo"></img></Link>
                    <Link className="main-bottion-black" to="/signIn">logIn</Link>
                </header>
                
                <section className="hero-con">
                    <h1>Incres productivity and engament with your students -for free</h1>
                    <p>create a cores with the days and tasks maped out for your students.
                        get access to Learning halls corse creation tools for free</p>
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