import React from "react";
import HallContainner from "./Hall/hall_container"
import Profile from "./profile/profile"
import SplashContainner from "./splash/splash.container"
import SignUpContainer from "./session/signup_container";
import SignInContainer from "./session/signin_container";
import NavBarContainer from "./nav_bar/nav_bar_container";
import { Route, HashRouter, Switch } from "react-router-dom";
import {Provider} from "react-redux";
import { AuthRoute, ProtectdRoute} from "../util/route_utils";

const App = ({store}) => {


    // <h1>Hello World</h1>
        return(
            <div className="Main">
                <Provider store={store}>
                    <HashRouter>
                        <Route path="/" component={NavBarContainer}/>
                        <Switch>
                            <AuthRoute path="/signup" component={SignUpContainer}/>
                            <AuthRoute path="/signIn" component={SignInContainer}/>
                            <AuthRoute path="/" component={SplashContainner}/>
                        </Switch>


                        <Switch>
                            <ProtectdRoute path="/profile" component={Profile}/>
                            <ProtectdRoute path="/" component={HallContainner}/>
                        </Switch>

                    </HashRouter>
                </Provider>
            </div>
        )

}

export default App