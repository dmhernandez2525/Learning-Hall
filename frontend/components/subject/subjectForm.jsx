import React from "react";


class SubjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.subject;
        this.editState = { authorId: this.props.subject.authorId, name: this.props.subject.name }
        this.handleNew = this.handleNew.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.subject = ""
        this.subjectNames = []
    };

    handleInput(type) {
        return (e) => {
            this.setState({ [type]: e.target.value });
        };
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
        this.props.newSubject(this.editState)
    };


    render() {
        debugger
        let allSubjectNames = this.props.allSubjects.subjescts.map(subject => {
            this.subjectNames.push(subject.name)
        })
        if (this.state.FormType === "Make a New Subject"){
            return (
                <div className="sign_up_form">

                    <form className="course-form" onSubmit={this.handleNew}>
                        <h2 className="formH2">Make a New Subject</h2>

                        <input
                            className="bigInputProfile"
                            type="text"
                            value={this.state.name}
                            placeholder="subject name"
                            onChange={this.handleInput("name")}
                        />
                        <input
                            className="bigInputProfile"
                            type="text"
                            value={this.state.courseName}
                            placeholder="Course Name"
                            onChange={this.handleInput("courseName")}
                        />
                        {allSubjectNames}
                        <div className="task-buttion-div">
                            <input className="bigButtionProfile" type="submit" value={"make a new subject"} />
                        </div>
                    </form>
                    <div className="task-buttion-div">
                        <input className="bigButtionProfile" type="submit" onClick={this.handleInput("FormType") } value={"Edit a subject"} />
                    </div>

                </div>
                )
        }else{
            return (
                <div className="sign_up_form">

                    <form className="course-form" onSubmit={this.handleEdit}>
                        <h2 className="formH2">Edit Subject</h2>

                        {/* <input
                            className="bigInputProfile"
                            type="text"
                            value={this.state.subject}
                            placeholder="subject name"
                            onChange={this.handleInput("name")}
                        /> */}
                        <h2 className="formH2">Subject Name </h2>
                        <h2 className="formH2">{this.state.subject}</h2>
                        <select className="bigSelectorProfile" value={this.state.subject} onChange={this.handleInput('subject')}>
                            <option value={this.state.subject} selected disabled hidden>Select the subject you would like to edit</option>
                            <option value={this.subjectNames[0]}>{this.subjectNames[0]}</option>
                            <option value={this.subjectNames[1]}>{this.subjectNames[1]}</option>
                            <option value={this.subjectNames[2]}>{this.subjectNames[2]}</option>
                            <option value={this.subjectNames[3]}>{this.subjectNames[3]}</option>
                            <option value={this.subjectNames[4]}>{this.subjectNames[4]}</option>
                            <option value={this.subjectNames[5]}>{this.subjectNames[5]}</option>
                            <option value={this.subjectNames[6]}>{this.subjectNames[6]}</option>
                            <option value={this.subjectNames[7]}>{this.subjectNames[7]}</option>
                            <option value={this.subjectNames[8]}>{this.subjectNames[8]}</option>
                            <option value={this.subjectNames[9]}>{this.subjectNames[9]}</option>
                            <option value={this.subjectNames[10]}>{this.subjectNames[10]}</option>
                            <option value={this.subjectNames[11]}>{this.subjectNames[11]}</option>
                            <option value={this.subjectNames[12]}>{this.subjectNames[12]}</option>
                            <option value={this.subjectNames[13]}>{this.subjectNames[13]}</option>
                            <option value={this.subjectNames[14]}>{this.subjectNames[14]}</option>
                            <option value={this.subjectNames[15]}>{this.subjectNames[15]}</option>
                            <option value={this.subjectNames[16]}>{this.subjectNames[16]}</option>
                            <option value={this.subjectNames[17]}>{this.subjectNames[17]}</option>
                            <option value={this.subjectNames[18]}>{this.subjectNames[18]}</option>
                            <option value={this.subjectNames[19]}>{this.subjectNames[19]}</option>                        </select>

                        <input
                            className="bigInputProfile"
                            type="text"
                            value={this.state.courseName}
                            placeholder="New Name"
                            onChange={this.handleInput("courseName")}
                        />

                        <div className="task-buttion-div">
                            <input className="bigButtionProfile" type="submit" value={"Edit Subject Name"} />
                        </div>
                    </form>
                    <div className="task-buttion-div">
                        <input className="bigButtionProfile" type="submit" onClick={this.handleInput("FormType")} value={"Make a New Subject"} />
                    </div>

                </div>
            )
        }
    };
};



export default SubjectForm;






