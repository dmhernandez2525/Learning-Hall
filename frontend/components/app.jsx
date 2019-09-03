import React from "react"
import SignUpContainer from "./session/signup_container"
import NavBarContainer from "./nav_bar/nav_bar_container"
import { Route, HashRouter } from "react-router-dom"
import {Provider} from "react-redux"

const App = ({store}) => {


        return(
            <div className="Main">
                <h1>Hello World</h1>
                <Provider store={store}>
                    <HashRouter>
                        <NavBarContainer/>
                        <Route path="/signup" component={SignUpContainer}/>
                    </HashRouter>
                </Provider>
            </div>
        )

}

export default App