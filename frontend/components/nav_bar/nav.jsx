import React from "react"
import {Link} from "react-router-dom"


const NavBar = ({ currentUser, signOut}) => {

    const display = (
        <div>
            <Link className="buttion" to="/signup"> Sign Up</Link>
            <Link className="buttion" to="/logIn">logIn</Link>
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