import { signIn, clearErrors } from "../../actions/session";
import { connect } from "react-redux";
import SignIn from "./signin";

interface RootState {
  errors: {
    session: string[];
  };
}

interface SignInUser {
  username: string;
  password: string;
}

const mapStateToProps = (state: RootState) => {
  return {
    user: {
      username: "",
      password: "",
    },
    errors: state.errors.session,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    signIn: (user: SignInUser) => dispatch(signIn(user)),
    clearErrors: () => dispatch(clearErrors()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
