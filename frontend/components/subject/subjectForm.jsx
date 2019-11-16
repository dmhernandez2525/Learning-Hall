import React from "react";


class SubjectForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.subject;
        this.handleSumbit = this.handleSumbit.bind(this);
    };

    handleInput(type) {
        return (e) => {
            this.setState({ [type]: e.target.value });
        };
    };


    handleSumbit(event) {
        event.preventDefault();
        this.props.newSubject(this.state)
    };


    render() {


        return (
            <div className="sign_up_form">

                <form className="course-form" onSubmit={this.handleSumbit}>
                    <h2 className="formH2">make a new subject</h2>

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
                    {/* <input
                        className="bigInputProfile"
                        type="text"
                        value={this.state.courseId}
                        placeholder=""
                        onChange={this.handleInput("courseId")}
                    /> */}



                    <div className="task-buttion-div">
                        <input className="bigButtionProfile" type="submit" value={"make a new subject"} />
                    </div>
                </form>
            </div>

        )
    };
};



export default SubjectForm;