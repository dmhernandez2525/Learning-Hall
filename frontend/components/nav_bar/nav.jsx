import React from "react"
import {Link} from "react-router-dom"


const NavBar = ({ currentUser, signOut}) => {
    // debugger
    const display = currentUser ?  (
        <div>
            <p>Hello {currentUser.username}</p>
            <button onClick={() => signOut()}> Sign Out</button>
            
        </div>

    ) : (
        <div>
            <Link className="buttion" to="/signup"> Sign Up</Link>
            <Link className="buttion" to="/signIn">logIn</Link>
            {/* <div className="g-signin2" data-onsuccess="onSignIn"></div> */}
        </div>
    )
    // if (currentUser) {
    //     return (

    //         <header className="nav-bar">
    //             <h1 className="logo">{`welcome to ${currentUser} Learning Hall`}</h1>
    //             <div>
    //                 {display}
    //             </div>
    //         </header>

    //     )
    // } 
    return(

        <header className="nav-bar">
            <h1 className="logo">Welcome to the Learning Hall</h1>
            <div>
                {display}
            </div>
        </header>

    )


}


export default NavBar