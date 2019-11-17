import React from "react";
class TaskForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.task;
        this.handleSumbit = this.handleSumbit.bind(this);
        this.editState = { authorId: this.props.task.authorId, name: this.props.task.name }
        this.handleEdit = this.handleEdit.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.task = "";
        this.taskNames = [];
        this.allTasksss = {};
    };

    handleNew(event) {
        event.preventDefault();
        let newState = {
            name: this.state.name,
            authorId: this.state.authorId,
            courseName: this.state.courseName,
        }
        this.props.newSubject(newState)
    };

    handleEdit(event) {
        event.preventDefault();
        debugger
        let task = this.allTasksss[this.state.task]
        let taskId = task.id
        let name = this.state.name
        let body = this.state.body
        let duration = this.state.duration
        let newTask = {id: taskId, name, body, duration}
        this.props.updateTask(newTask)
    };

    handleDelete(event) {
        event.preventDefault();
        let task = this.allTasksss[this.state.task]
        let taskId = task.id
        this.props.deleteTask(taskId)
    };

    handleInput(type) {
        if (type === "task" && this.state.task !== ""){
            debugger
            let allTasksss = this.allTasksss
            let newTask = allTasksss[this.state.task]
            debugger
            return (e) => {
                this.setState({ body: newTask.body, duration: newTask.duration, name: newTask.name, [type]: e.target.value})
            }
        }
        return (e) => {
            this.setState({ [type]: e.target.value });
        };
    };


    handleSumbit(event) {
        event.preventDefault();
        let newState = {
            name: this.state.name,
            completed: true,
            duration: parseInt(this.state.duration),
            body: this.state.body,
            author_id: this.state.author_id,
            subjectName: this.state.subjectName,
        }
        this.props.newTask(newState)
    };


    render() {
        let taskNames = this.props.allTasks.tasks.map(task => {
            this.taskNames.push(task.name)
        })
        this.props.allTasks.tasks.forEach(task => {
            this.allTasksss[task.name] = task
        })


        if (this.state.FormType === "Make a New Task") {
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
                            value={this.state.duration}
                            placeholder="Duration"
                            onChange={this.handleInput("duration")}
                        />

                        <input
                            className="bigInputProfile"
                            type="text"
                                value={this.state.subjectName}
                            placeholder="Subject Name"
                                onChange={this.handleInput("subjectName")}
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
                    <div className="task-buttion-div">
                        <input className="bigButtionProfile" type="submit" onClick={this.handleInput("FormType")} value={"Edit a Task"} />
                    </div>
            </div>

            )
        }else{

            return (
                <div className="sign_up_form">
                    <form className="course-form" onSubmit={this.handleEdit}>
                        <h2 className="formH2">Edit Task</h2>
                        <h2 className="formH2">Task Name </h2>
                        {/* <h2 className="formH2">{this.state.task}</h2> */}
                        <select className="bigSelectorProfile" value={this.state.task} onChange={this.handleInput('task')}>
                            <option defaultValue >Select the task you would like to edit</option>
                            <option value={this.taskNames[0]}>{this.taskNames[0]}</option>
                            <option value={this.taskNames[1]}>{this.taskNames[1]}</option>
                            <option value={this.taskNames[2]}>{this.taskNames[2]}</option>
                            <option value={this.taskNames[3]}>{this.taskNames[3]}</option>
                            <option value={this.taskNames[4]}>{this.taskNames[4]}</option>
                            <option value={this.taskNames[5]}>{this.taskNames[5]}</option>
                            <option value={this.taskNames[6]}>{this.taskNames[6]}</option>
                            <option value={this.taskNames[7]}>{this.taskNames[7]}</option>
                            <option value={this.taskNames[8]}>{this.taskNames[8]}</option>
                            <option value={this.taskNames[9]}>{this.taskNames[9]}</option>
                            <option value={this.taskNames[10]}>{this.taskNames[10]}</option>
                            <option value={this.taskNames[11]}>{this.taskNames[11]}</option>
                            <option value={this.taskNames[12]}>{this.taskNames[12]}</option>
                            <option value={this.taskNames[13]}>{this.taskNames[13]}</option>
                            <option value={this.taskNames[14]}>{this.taskNames[14]}</option>
                            <option value={this.taskNames[15]}>{this.taskNames[15]}</option>
                            <option value={this.taskNames[16]}>{this.taskNames[16]}</option>
                            <option value={this.taskNames[17]}>{this.taskNames[17]}</option>
                            <option value={this.taskNames[18]}>{this.taskNames[18]}</option>
                            <option value={this.taskNames[19]}>{this.taskNames[19]}</option>                        
                        </select>

                        {/* <input
                            className="bigInputProfile"
                            type="text"
                            value={this.state.name}
                            placeholder="task name"
                            onChange={this.handleInput("name")}
                        /> */}
                        <input
                            className="bigInputProfile"
                            type="text"
                            value={this.state.name}
                            placeholder="New Name"
                            onChange={this.handleInput("name")}
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
                            <input className="bigButtionProfile" type="submit" value={"Edit Task"} />
                            <input className="bigButtionProfile" type="submit" onClick={this.handleDelete} value={"Delete Task"} />
                        </div>
                    </form>
                    <div className="task-buttion-div">
                        <input className="bigButtionProfile" type="submit" onClick={this.handleInput("FormType")} value={"Make a New Task"} />
                    </div>

                </div>
            )


        }
    };
};



export default TaskForm;