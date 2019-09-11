import React from "react";
import { Link } from "react-router-dom";
import Footer from "../footer/footer"


class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.user;
        this.handleSumbit = this.handleSumbit.bind(this);
    };

    handleInput(type) {
        return (e) => {
            this.setState({ [type]: e.target.value });
        };
    };
    componentWillUnmount() {
        this.props.clearErrors()
    }

    handleSumbit(event) {
        event.preventDefault();

        this.props.signUp(this.state)
        // .then(this.props.history.push("/hall"))
    };


    render() {

        let errors = this.props.errors.map(e => {
            return (
                <li className="errors">{e}</li>
            )
        })
        let Errors;
        if (this.props.errors.length){
            Errors = <ul >{errors}</ul>
        }else{
            Errors = <ul className="has-no-errors">{errors}</ul>

        }

        return (
            <div className="sign_up_in_div">


                {Errors}
                <form className="auth_form" onSubmit={this.handleSumbit}>
                    {/* <h2 className="formH2"> Sign up to start Learning </h2> */}
                    <h2 > Sign up to start Learning </h2>
                    {/* <label >Username */}
                    <input
                        className="auth-big-input"
                        type="text"
                        value={this.state.username}
                        placeholder="Username"
                        onChange={this.handleInput("username")}
                    />
                    {/* </label> */}

                    {/* <label >Email */}
                    <input
                        className="auth-big-input"
                        type="text"
                        value={this.state.email}
                        placeholder="Email"
                        onChange={this.handleInput("email")}
                    />
                    
                    <input
                        className="auth-big-input"
                        type="password"
                        value={this.state.password}
                        placeholder="Password"
                        onChange={this.handleInput("password")}
                    />                   
                    
                    <div className="sign_up_in_div_input">
                        <input
                            className="auth-big-input-split"
                            type="text"
                            value={this.state.preferred_name}
                            placeholder="Preferred Name"
                            onChange={this.handleInput("preferred_name")}
                        />

                        <input
                            className="auth-big-input-split"
                            type="text"
                            value={this.state.pronunciation}
                            placeholder="Pronunciation"
                            onChange={this.handleInput("pronunciation")}
                        />
                    </div>




                    <input
                        className="auth-big-input"
                        type="text"
                        value={this.state.user_role}
                        placeholder="User Role"
                        onChange={this.handleInput("user_role")}
                    />

                    {/* </label> */}
                    {/* <label > */}
                    <input className="big-buttion-auth" type="submit" value={"Continue"} />
                    {/* </label> */}
                    <div className="a1">
                        Allready have an account? &nbsp;
                        <Link to="/signIn">click here to login.</Link>






                    </div>
                        <div className="g-signin2" data-onsuccess="onSignIn"></div>

                </form>

                {/* <Footer/> */}

            </div>

        )
    };
};



export default SignUp;