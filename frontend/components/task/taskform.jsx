import React from "react";


class TaskForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.task;
        this.handleSumbit = this.handleSumbit.bind(this);
    };

    handleInput(type) {
        return (e) => {
            this.setState({ [type]: e.target.value });
        };
    };


    handleSumbit(event) {
        event.preventDefault();

        this.props.newTask(this.state)
    };


    render() {


        return (
            <div className="sign_up_form">

                <form onSubmit={this.handleSumbit}>
                    <h2 className="formH2">make a new task</h2>

                    <input
                        className="big-input"
                        type="text"
                        value={this.state.name}
                        placeholder="task name"
                        onChange={this.handleInput("name")}
                    />

                    <textarea
                        className="big-input"

                        value={this.state.body}
                        placeholder="type out a lession here"
                        onChange={this.handleInput("body")}
                    />

                    <div>
                        <input className="big-buttion" type="submit" value={"make a new Task"} />
                    </div>
                </form>
         </div>

        )
    };
};



export default TaskForm;