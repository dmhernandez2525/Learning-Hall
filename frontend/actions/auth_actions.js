import * as UserAPIUtil from '../util/user_api_util.js';

      export const LOG_OUT = "LOG_OUT";
      export const SIGN_UP = "SIGN_UP";
      export const SIGN_IN = "SIGN_IN";
      
        export const signup = (user) => (dispatch) => (
            UserAPIUtil.signup(user).then(user => dispatch({
                type: SIGN_UP,
                user
            }))
        )


        export const login = (user) => (dispatch) => (
            UserAPIUtil.login(report).then(user => dispatch({
                type: SIGN_IN,
                user
            }))
        )

        export const logout = () => (dispatch) => (
            UserAPIUtil.logout(report).then(() => dispatch({
                type: LOG_OUT,
            }))
        )
