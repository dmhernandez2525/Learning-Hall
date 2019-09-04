import React from "react";
import HallContainner from "./Hall/hall_container"
import SplashContainner from "./splash/splash.container"
import SignUpContainer from "./session/signup_container";
import SignInContainer from "./session/signin_container";
import NavBarContainer from "./nav_bar/nav_bar_container";
import { Route, HashRouter } from "react-router-dom";
import {Provider} from "react-redux";
import { AuthRoute, ProtectdRoute} from "../util/route_utils";

const App = ({store}) => {


    // <h1>Hello World</h1>
        return(
            <div className="Main">
                <Provider store={store}>
                    <HashRouter>
                        <Route path="/" component={NavBarContainer}/>
                        <AuthRoute path="/" component={SplashContainner}/>
                        <ProtectdRoute path="/" component={HallContainner}/>
                        <AuthRoute path="/signup" component={SignUpContainer}/>
                        <AuthRoute path="/signIn" component={SignInContainer}/>
                    </HashRouter>
                </Provider>
            </div>
        )

}

export default App