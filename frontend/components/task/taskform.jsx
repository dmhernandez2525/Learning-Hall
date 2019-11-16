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
        this.state.duration = parseInt(this.state.duration)
        this.props.newTask(this.state)
    };


    render() {


        return (
            <div className="sign_up_form">

                <form className="course-form" onSubmit={this.handleSumbit}>
                    <h2 className="formH2">Make a New Task</h2>

                    <input
                        className="bigInputProfile"
                        type="text"
                        value={this.state.name}
                        placeholder="task name"
                        onChange={this.handleInput("name")}
                    />
                    <input
                        className="bigInputProfile"
                        type="text"
                        value={this.state.subjectName}
                        placeholder="Subject name"
                        onChange={this.handleInput("subjectName")}
                    />
                    <input
                        className="bigInputProfile"
                        type="text"
                        value={this.state.duration}
                        placeholder="Duration"
                        onChange={this.handleInput("duration")}
                    />
                    <textarea
                        
                        className="bigInputProfile"
                        id="task-new"

                        value={this.state.body}
                        placeholder="type out a lesson here "
                        onChange={this.handleInput("body")}
                    />

                    <div className="task-buttion-div">
                        <input className="bigButtionProfile" type="submit" value={"make a new Task"} />
                    </div>
                </form>
         </div>

        )
    };
};



export default TaskForm;