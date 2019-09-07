import React from "react";
import {connect} from "react-redux";
import {Redirect, Route, withRouter} from "react-router-dom";


const mapStateToProps = (state) => {
    return({
    
        loggedIn: Boolean(state.session.currentUser)
    
    })
}

const Auth = ({loggedIn, path, component: Component}) => {
    return(
        <Route 
            path={path}
            render={props =>{
                return(
                    loggedIn ? <Redirect to="/" /> : <Component {...props}/>
                )
            }}

        />
    )
}

const Protectd = ({loggedIn, path , component: Component}) => {
    return(
        <Route
            path={path}
            render={props => {
                return(
                    loggedIn ? <Component {...props} /> : <Redirect to="/signup"/>
                )
            }}
        />
    )

}

export const AuthRoute = withRouter(connect(mapStateToProps)(Auth))
export const ProtectdRoute = withRouter(connect(mapStateToProps)(Protectd))