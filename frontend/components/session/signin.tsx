import React from "react";
import { Link } from "react-router-dom";

interface SignInUser {
  username: string;
  password: string;
}

interface SignInProps {
  user: SignInUser;
  errors: string[];
  signIn: (user: SignInUser) => void;
  clearErrors: () => void;
}

interface SignInState {
  username: string;
  password: string;
}

class SignIn extends React.Component<SignInProps, SignInState> {
  constructor(props: SignInProps) {
    super(props);
    this.state = this.props.user;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.prettyDemoUser = this.prettyDemoUser.bind(this);
  }

  handleInput(): (e: React.ChangeEvent<HTMLInputElement>) => void {
    return (e) => this.setState({ username: e.target.value });
  }

  componentWillUnmount(): void {
    if (!this.props.errors.length) {
      this.props.clearErrors();
    }
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    this.props.signIn(this.state);
  }

  async prettyDemoUser(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    e.preventDefault();
    const demoUser = {
      username: "demoUser",
      password: "hunter2",
    };
    const sleep = (ms: number): Promise<void> =>
      new Promise((res) => setTimeout(res, ms));

    const usernameInput = document.getElementById("username-input");
    if (usernameInput) usernameInput.focus();

    for (let i = 1; i <= demoUser.username.length; i++) {
      this.setState({ username: demoUser.username.substr(0, i) });
      await sleep(200);
    }
    await sleep(200);

    const passwordInput = document.getElementById("password-input");
    if (passwordInput) passwordInput.focus();

    for (let i = 1; i <= demoUser.password.length; i++) {
      this.setState({ password: demoUser.password.substr(0, i) });
      await sleep(200);
    }
    await sleep(500);

    const submitBtn = document.getElementById("session-submit-btn");
    if (submitBtn) submitBtn.click();

    if (passwordInput) passwordInput.blur();
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

        <form className="auth_form" onSubmit={this.handleSubmit}>
          <div className="auth_form_top">
            <h2>Get back to learning</h2>
            <h3>Login to your account</h3>
          </div>

          <input
            id="username-input"
            className="auth-big-input"
            placeholder="Username"
            type="text"
            value={this.state.username}
            onChange={this.handleInput()}
          />
          <input
            id="password-input"
            className="auth-big-input"
            placeholder="Password"
            type="password"
            value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })}
          />
          <input
            id="session-submit-btn"
            className="big-buttion-auth"
            type="submit"
            value={"Log In"}
          />
          <div className="auth_form_form">
            <button
              onClick={(e) => this.prettyDemoUser(e)}
              className="big-buttion-auth"
            >
              DEMO
            </button>
          </div>
          <div className="a1">
            dont have an account? &nbsp;
            <Link to="/signUp">click here sign up.</Link>
          </div>
        </form>
      </div>
    );
  }
}

export default SignIn;
