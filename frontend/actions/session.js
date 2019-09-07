// import { signUp ,logIn, signOut } from "../util/session"
import * as APIuser from "../util/session"
export const RECEIVE_CURRENT_USER = "RECEIVE_CURRENT_USER"; 
export const LOGOUT_CURRENT_USER = "LOGOUT_CURRENT_USER";
export const RECEIVE_SESSION_ERRORS = "RECEIVE_SESSION_ERRORS";
export const CLEAR_SESSION_ERRORS = "CLEAR_SESSION_ERRORS";


export const signUp = (user) => (dispatch) => {
    return(
        APIuser.signUp(user).then(user => dispatch({
            type: RECEIVE_CURRENT_USER,
            user
        })
        ,
        error => dispatch(receiveErrors(error.responseJSON)))
        
    )
}
export const signIn = (user) => (dispatch) => {
    return(
        APIuser.logIn(user).then(user => dispatch({
            type: RECEIVE_CURRENT_USER,
            user
        })
        ,
        error => dispatch(receiveErrors(error.responseJSON))
        )
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


export const receiveErrors = (errors) => {
    return({
        type: RECEIVE_SESSION_ERRORS,
        errors
    })
}

export const clearErrors = () => {
    return({
        type: CLEAR_SESSION_ERRORS,
    })
}

//   function signOut() {
//       var auth2 = gapi.auth2.getAuthInstance();
//       auth2.signOut().then(function () {
//           console.log('User signed out.');
//       });
//   }

