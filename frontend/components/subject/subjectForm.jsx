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

                <form onSubmit={this.handleSumbit}>
                    <h2 className="formH2">make a new subject</h2>

                    <input
                        className="big-input"
                        type="text"
                        value={this.state.name}
                        placeholder="subject name"
                        onChange={this.handleInput("name")}
                    />
                    <input
                        className="big-input"
                        type="text"
                        value={this.state.courseId}
                        placeholder=""
                        onChange={this.handleInput("courseId")}
                    />



                    <div>
                        <input className="big-buttion" type="submit" value={"make a new subject"} />
                    </div>
                </form>
            </div>

        )
    };
};



export default SubjectForm;