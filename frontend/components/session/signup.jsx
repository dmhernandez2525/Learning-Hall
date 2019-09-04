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

                <h2> Sign Up </h2>

                <form onSubmit={this.handleSumbit}>
                    {/* <label >Username */}
                    <input
                        type="text"
                        value={this.state.username}
                        onChange={this.handleInput("username")}
                    />
                    {/* </label> */}

                    {/* <label >Email */}
                    <input
                        type="text"
                        value={this.state.email}
                        onChange={this.handleInput("email")}
                    />
                    {/* </label> */}

                    {/* <label >Preferred_name */}
                    <input
                        type="text"
                        value={this.state.preferred_name}
                        onChange={this.handleInput("preferred_name")}
                    />
                    {/* </label> */}

                    {/* <label >Password */}
                    <input
                        className="password"
                        type="password"
                        value={this.state.password}
                        placeholder="Password"
                        onChange={this.handleInput("password")}
                    />
                    {/* </label> */}

                    {/* <label >User_role */}
                    <input
                        type="text"
                        value={this.state.user_role}
                        onChange={this.handleInput("user_role")}
                    />
                    {/* </label> */}

                    {/* <label >Pronunciation */}
                    <input
                        type="text"
                        value={this.state.pronunciation}
                        onChange={this.handleInput("pronunciation")}
                    />

                    {/* </label> */}
                    {/* <label > */}
                    <div>
                        <input className="sign_up_buttion" type="submit" value={"Continue"} />
                    </div>
                    {/* </label> */}
                    <div>
                        All ready have an asccount?
                        <Link to="/signIn">click here to login.</Link>
                    </div>
                </form>


            </div>

        )
    };
};



export default SignUp;