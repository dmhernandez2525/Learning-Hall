import { connect } from "react-redux";
import { signUp, clearErrors } from "../../actions/session";
import SignUp from "./signup";

interface RootState {
  errors: {
    session: string[];
  };
}

interface SignUpUser {
  username: string;
  email: string;
  password: string;
  preferred_name: string;
  pronunciation: string;
  user_role: string;
}

const mapStateToProps = (state: RootState) => ({
  user: {
    username: "",
    email: "",
    preferred_name: "",
    password: "",
    user_role: "",
    pronunciation: "",
  },
  errors: state.errors.session,
});

const mapDispatchToProps = (dispatch: any) => ({
  signUp: (user: SignUpUser) => dispatch(signUp(user)),
  clearErrors: () => dispatch(clearErrors()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
