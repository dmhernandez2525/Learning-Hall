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
    handleSubmit(event){
        debugger
        event.preventDefault();
        this.props.signIn(this.state)
        // .this.props.history.push("/hall")
    }
    render(){
        // debugger


        return (
            <div >
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