import React from "react";


class CourseForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.course;
        this.handleSumbit = this.handleSumbit.bind(this);
    };

    handleInput(type) {
        return (e) => {
            this.setState({ [type]: e.target.value });
        };
    };


    handleSumbit(event) {
        event.preventDefault();
        this.props.newCourse(this.state)
    };


    render() {


        return (
            <div className="sign_up_form">

                <form onSubmit={this.handleSumbit}>
                    <h2 className="formH2">make a new course</h2>

                    <input
                        className="big-input"
                        type="text"
                        value={this.state.name}
                        placeholder="course name"
                        onChange={this.handleInput("name")}
                    />

                    <div>
                        <input className="big-buttion" type="submit" value={"make a new course"} />
                    </div>
                </form>
            </div>

        )
    };
};



export default CourseForm;