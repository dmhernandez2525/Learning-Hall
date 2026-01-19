import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import Hall from "./hall";
import { receiveTask } from "../../actions/session";
import type { RootState } from "../../types";

const mapStateToProps = (state: RootState) => ({
  currentTask: state.session.currentTask
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  receiveTask: (task: string) => dispatch(receiveTask(task))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type HallContainerProps = ConnectedProps<typeof connector>;

export default connector(Hall);
