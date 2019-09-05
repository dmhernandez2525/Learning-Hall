import React from "react"
import {Link} from "react-router-dom"


class SignIn extends React.Component{
    constructor(props){
        // debugger
        super(props)
        this.state = this.props.user
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleInput = this.handleInput.bind(this)
    }
    handleInput(){
        // debugger
        return e => this.setState({ username: e.target.value})
    }

    componentWillUnmount(){
        this.props.clearErrors()
    }
    handleSubmit(event){
        // debugger
        event.preventDefault();
        this.props.signIn(this.state)
        // .this.props.history.push("/hall")
    }


    render(){
        // debugger

        let errors = this.props.errors.map((e,i) => {
            return(
                <li key={i} className="errors">{e}</li>
            )
        })
        return (
            <div >
                <ul>{errors}</ul>
                <div className="a11">
                <h1>Get back to learning</h1>
                    <h2> Login to your account</h2>
                </div>
                <form className="login_form" onSubmit={this.handleSubmit}>
                    <input className="login-input" placeholder="Username" type="text" value={this.state.username} onChange={this.handleInput()}/>
                    <input className="login-input" placeholder="Password" type="password" value={this.state.password} onChange={e => this.setState({ password: e.target.value })}/>
                    <button className="big-buttion-input" >Log In</button>
                </form>

                <div className="a1">
                    dont have an account? &nbsp;
                    <Link to="/signUp">click here sign up.</Link>
                </div>
            </div>
        )
    }
}

export default SignIn