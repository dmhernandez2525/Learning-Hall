import React from "react";


class SubjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.subject;
        this.editState = { authorId: this.props.subject.authorId, name: this.props.subject.name }
        this.handleNew = this.handleNew.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.subject = "";
        this.subjectNames = [];
        this.courseNames = [];
        this.allSubjectsss = {};
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
        let subjectId = this.allSubjectsss[this.state.subject]
        let authorId = this.state.authorId
        let name = this.state.name
        this.props.showSubject(subjectId).then(subject => {
            let newSubject = {
                id: subjectId, name, courseId: subject.subject.courseId, authorId
            }
            this.props.updateSubject(newSubject)
        })
    };

    handleDelete(event) {
        event.preventDefault();
        let subjectId = this.allSubjectsss[this.state.subject]
        this.props.deleteSubject(subjectId)
    };


    render() {
        debugger
        if (this.subjectNames.length) {

        } else {
            let allSubjectNames = this.props.allSubjects.subjescts.map(subject => {
                debugger
                this.subjectNames.push(<option value={subject.name}>{subject.name}</option>)
            })
            let allCourseNames = this.props.allCourse.courses.map(course => {
                debugger
                this.courseNames.push(<option value={course.name}>{course.name}</option>)
            })
        }


       this.props.allSubjects.subjescts.forEach(subject => {
            this.allSubjectsss[subject.name] = subject.id
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

                        <select className="bigSelectorProfile" value={this.state.courseName} onChange={this.handleInput('courseName')}>
                            <option defaultValue >Select the name of the course that you want the subject to be listed under</option>
                            {this.courseNames}
                        </select>


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
                        <select className="bigSelectorProfile" value={this.state.subject} onChange={this.handleInput('subject')}>
                            <option defaultValue >Select the subject you would like to edit</option>
                            {this.subjectNames}
                        </select>
                        <input
                            className="bigInputProfile"
                            type="text"
                            value={this.state.name}
                            placeholder="New Name"
                            onChange={this.handleInput("name")}
                        />
                        <div className="task-buttion-div">
                            <input className="bigButtionProfile" type="submit" value={"Edit Subject Name"} />
                            <input className="bigButtionProfile" type="submit" onClick={this.handleDelete} value={"Delete Subject"} />
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






