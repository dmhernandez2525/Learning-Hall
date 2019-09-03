// import { signUp ,logIn, signOut } from "../util/session"
import * as APIuser from "../util/session"
export const RECEIVE_CURRENT_USER = "RECEIVE_CURRENT_USER"; 
export const LOGOUT_CURRENT_USER = "LOGOUT_CURRENT_USER";


export const signUp = (user) => (dispatch) => {
    return(
        APIuser.signUp(user).then(user => dispatch({
            type: RECEIVE_CURRENT_USER,
            user
        }))
    )
}
export const logIn = (user) => (dispatch) => {
    return(
        APIuser.logIn(user).then(user => dispatch({
            type: RECEIVE_CURRENT_USER,
            user
        }))
    )
}
export const signOut = () => (dispatch) => {
    return(
        APIuser.signOut().then(userId => dispatch({
            type: LOGOUT_CURRENT_USER,
            userId
        }))
    )
}

