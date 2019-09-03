import React from "react"
import SignUpContainer from "./session/signup_container"
import {Provider, Route, HashRouter } from "react-router-dom"

const App = ({store}) => {


        return(
            <Provider store={store}>
                <HashRouter>
                    <div className="Main">
                        <h1>Hello World</h1>
                        <Route path="/signUp" container={SignUpContainer}/>
                    </div>
                </HashRouter>
            </Provider>
        )

}

export default App