import React from "react";
import { Link } from "react-router-dom";

interface SignUpUser {
  username: string;
  email: string;
  password: string;
  preferred_name: string;
  pronunciation: string;
  user_role: string;
}

interface SignUpProps {
  user: SignUpUser;
  errors: string[];
  signUp: (user: SignUpUser) => void;
  clearErrors: () => void;
}

interface SignUpState {
  username: string;
  email: string;
  password: string;
  preferred_name: string;
  pronunciation: string;
  user_role: string;
}

class SignUp extends React.Component<SignUpProps, SignUpState> {
  constructor(props: SignUpProps) {
    super(props);
    this.state = this.props.user;
    this.handleSumbit = this.handleSumbit.bind(this);
  }

  handleInput(
    type: keyof SignUpState
  ): (e: React.ChangeEvent<HTMLInputElement>) => void {
    return (e) => {
      this.setState({ [type]: e.target.value } as Pick<
        SignUpState,
        keyof SignUpState
      >);
    };
  }

  componentWillUnmount(): void {
    if (!this.props.errors.length) {
      this.props.clearErrors();
    }
  }

  handleSumbit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    this.props.signUp(this.state);
  }

  render(): React.ReactNode {
    const errors = this.props.errors.map((e, i) => {
      return (
        <li key={i} className="errors">
          {e}
        </li>
      );
    });

    let Errors: React.ReactNode;
    if (this.props.errors.length) {
      Errors = <ul className="heyYou">{errors}</ul>;
    } else {
      Errors = <ul className="has-no-errors">{errors}</ul>;
    }

    return (
      <div className="sign_up_in_div">
        {Errors}

        <form className="auth_form" onSubmit={this.handleSumbit}>
          <div className="auth_form_top">
            <h2>Sign up to start Learning</h2>
            <h3>Create your account</h3>
          </div>

          <input
            className="auth-big-input"
            type="text"
            value={this.state.username}
            placeholder="Username"
            onChange={this.handleInput("username")}
          />

          <input
            className="auth-big-input"
            type="email"
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

          <input
            className="big-buttion-auth"
            type="submit"
            value={"Continue"}
          />

          <div className="a1">
            Allready have an account? &nbsp;
            <Link to="/signIn">click here to login.</Link>
          </div>
        </form>
      </div>
    );
  }
}

export default SignUp;
