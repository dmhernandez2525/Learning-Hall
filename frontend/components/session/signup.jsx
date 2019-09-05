import React from "react";
import { Link } from "react-router-dom";

// debugger
class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.user;
        this.handleSumbit = this.handleSumbit.bind(this);
        // debugger
    };

    handleInput(type) {
        // debugger
        return (e) => {
            this.setState({ [type]: e.target.value });
        };
    };

    handleSumbit(event) {
        event.preventDefault();
        // debugger

        this.props.signUp(this.state)
        // .then(this.props.history.push("/hall"))
    };


    render() {
        return (
            <div className="sign_up_form">


                <form onSubmit={this.handleSumbit}>
                    <h2> Sign up to start Learning </h2>
                    {/* <label >Username */}
                    <input
                        className="big-input"
                        type="text"
                        value={this.state.username}
                        placeholder="Username"
                        onChange={this.handleInput("username")}
                    />
                    {/* </label> */}

                    {/* <label >Email */}
                    <input
                        className="big-input"
                        type="text"
                        value={this.state.email}
                        placeholder="Email"
                        onChange={this.handleInput("email")}
                    />
                    {/* </label> */}

                    {/* <label >Preferred_name */}
                    <input
                        className="big-input"
                        type="text"
                        value={this.state.preferred_name}
                        placeholder="Preferred Name"
                        onChange={this.handleInput("preferred_name")}
                    />
                    {/* </label> */}

                    {/* <label >Password */}
                    <input
                        className="big-input"
                        type="password"
                        value={this.state.password}
                        placeholder="Password"
                        onChange={this.handleInput("password")}
                    />
                    {/* </label> */}

                    {/* <label >User_role */}
                    <input
                        className="big-input"
                        type="text"
                        value={this.state.user_role}
                        placeholder="User Role"
                        onChange={this.handleInput("user_role")}
                    />
                    {/* </label> */}

                    {/* <label >Pronunciation */}
                    <input
                        className="big-input"
                        type="text"
                        value={this.state.pronunciation}
                        placeholder="Pronunciation"
                        onChange={this.handleInput("pronunciation")}
                    />

                    {/* </label> */}
                    {/* <label > */}
                    <div>
                        <input className="big-buttion" type="submit" value={"Continue"} />
                    </div>
                    {/* </label> */}
                    <div className="a1">
                        All ready have an asccount? &nbsp;
                        <Link to="/signIn">click here to login.</Link>
                    </div>
                </form>


            </div>

        )
    };
};



export default SignUp;