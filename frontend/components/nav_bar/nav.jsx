import React from "react"
import {Link} from "react-router-dom"



const NavBar = ({ currentUser, signOut, history}) => {
    debugger
    const display = currentUser ?  (
        <div>
            <form onSubmit={e => e.preventDefault}>
                <p>Hello {currentUser.username}</p>
                <button onClick={() => signOut()}> Sign Out</button>
            </form>
        </div>

    ) : (history === "/signup") ? (
        <div>
            {/* <div className="g-signin2" data-onsuccess="onSignIn"></div> */}
        </div>
    ) : (
        <div>
            <Link className="buttion" to="/signIn">logIn</Link>
        </div>
    )

    return(

        <header className="nav-bar">
            <Link className="logo" to="/" ><img src="/assets/Screenshot from 2019-09-04 13-22-55.png" alt="Learning Hall Logo"></img></Link>
            <div>
                {display}
            </div>
        </header>

    )


}


export default NavBar