import React from "react"
import {createStore} from "redux"
import rootReducer from "../reducers/root_reducer"
import {applyMiddleWare} from "react"
// import {thunk} from "./middle_wares"
import {thunk} from "react"

const configureStore = (preloadedState = {}) => (
    createStore(rootReducer,preloadedState, applyMiddleWare(thunk))
)


export default configureStore