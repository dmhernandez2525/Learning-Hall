import React, { Suspense, lazy } from "react";
import Profile from "./profile/profile";
import NavBarContainer from "./nav_bar/nav_bar_container";
import { Route, HashRouter, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthRoute, ProtectdRoute } from "../util/route_utils";
import Footer from "./footer/footer";
import Loading from "./loading/loading";
import { Store } from "redux";

// Lazy load components for code splitting
const HallContainner = lazy(() => import("./Hall/hall_container"));
const SplashContainner = lazy(() => import("./splash/splash.container"));
const SignUpContainer = lazy(() => import("./session/signup_container"));
const SignInContainer = lazy(() => import("./session/signin_container"));

interface AppProps {
  store: Store;
}

const App: React.FC<AppProps> = ({ store }) => {
  return (
    <div className="Main" role="application" aria-label="Learning Hall Application">
      <Provider store={store}>
        <HashRouter>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Route path="/" component={NavBarContainer} />
          <Suspense fallback={<Loading />}>
            <Switch>
              <AuthRoute path="/signup" component={SignUpContainer} />
              <AuthRoute path="/signIn" component={SignInContainer} />
              <AuthRoute path="/" component={SplashContainner} />
            </Switch>
            <Switch>
              <ProtectdRoute path="/profile" component={Profile} />
              <ProtectdRoute path="/" component={HallContainner} />
            </Switch>
          </Suspense>
          <AuthRoute path="/" component={Footer} />
        </HashRouter>
      </Provider>
    </div>
  );
};

export default App;
