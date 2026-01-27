import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { signOut, receiveTask } from "../../actions/session";
import Profile from "./profile";
import type { RootState } from "../../types";

const mapStateToProps = (state: RootState) => ({
  currentUser: state.session.currentUser!,
  currentTask: state.session.currentTask
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  signOut: () => dispatch(signOut() as unknown as { type: string }),
  receiveTask: (task: string) => dispatch(receiveTask(task))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type ProfileComponentProps = ConnectedProps<typeof connector>;

export default connector(Profile);
