import React from 'react';
import ReactDOM from 'react-dom';
import {logIn , signOut , signUp} from "./util/session"
import App from './components/app';

import configureStore from './store/store';
    window.logIn = logIn
    // debugger;
    window.signUp = signUp

    window.signOut = signOut
document.addEventListener("DOMContentLoaded", () => {
    // debugger
    // const store = configureStore()
    const root = document.getElementById("root")
    ReactDOM.render(<App />, root)
})
// ReactDOM.render(<App  store={store}/>, root)
