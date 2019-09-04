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
            <div className="login_form">
                <form onSubmit={this.handleSubmit}>
                    <label >Username
                        <input type="text" value={this.state.username} onChange={this.handleInput()}/>
                    </label>
                    <label >Password
                        <input type="password" value={this.state.password} onChange={e => this.setState({ password: e.target.value })}/>
                    </label>
                    <button>Log In</button>
                </form>
            </div>
        )
    }
}

export default SignIn