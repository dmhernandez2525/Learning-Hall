import { connect } from "react-redux";
import NavBar from "./nav";
import { signOut } from "../../actions/session";

interface RootState {
  session: {
    currentUser: {
      id: number;
      username: string;
      email?: string;
    } | null;
  };
}

interface OwnProps {
  history: {
    location: {
      pathname: string;
    };
  };
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const currentUser = state.session.currentUser;
  return {
    currentUser,
    history: ownProps.history.location.pathname,
  };
};

const mapDispatichToProps = (dispatch: any) => {
  return {
    signOut: () => dispatch(signOut()),
  };
};

export default connect(mapStateToProps, mapDispatichToProps)(NavBar);
