import React from "react";
import { connect } from "react-redux";
import { Redirect, Route, withRouter, RouteComponentProps } from "react-router-dom";

interface RootState {
  session: {
    currentUser: object | null;
  };
}

interface AuthRouteStateProps {
  loggedIn: boolean;
}

interface AuthRouteOwnProps {
  path: string;
  component: React.ComponentType<RouteComponentProps | any>;
}

type AuthRouteProps = AuthRouteStateProps & AuthRouteOwnProps & RouteComponentProps;

const mapStateToProps = (state: RootState): AuthRouteStateProps => {
  return {
    loggedIn: Boolean(state.session.currentUser),
  };
};

const Auth: React.FC<AuthRouteProps> = ({ loggedIn, path, component: Component }) => {
  return (
    <Route
      path={path}
      render={(props) => {
        return loggedIn ? <Redirect to="/" /> : <Component {...props} />;
      }}
    />
  );
};

const Protectd: React.FC<AuthRouteProps> = ({ loggedIn, path, component: Component }) => {
  return (
    <Route
      path={path}
      render={(props) => {
        return loggedIn ? <Component {...props} /> : <Redirect to="/signup" />;
      }}
    />
  );
};

export const AuthRoute = withRouter(
  connect(mapStateToProps)(Auth as React.ComponentType<any>)
);

export const ProtectdRoute = withRouter(
  connect(mapStateToProps)(Protectd as React.ComponentType<any>)
);
