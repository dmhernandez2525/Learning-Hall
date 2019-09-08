import React from "react"
import {Link} from "react-router-dom"
import Footer from "../footer/footer"



class SignIn extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.user
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleInput = this.handleInput.bind(this)
        // this.handleDemo = this.handleDemo.bind(this)
        this.prettyDemoUser = this.prettyDemoUser.bind(this);
    }
    handleInput(){
        return e => this.setState({ username: e.target.value})
    }

    componentWillUnmount(){
        this.props.clearErrors()
    }
    handleSubmit(event){
        event.preventDefault();
        this.props.signIn(this.state)
        // .this.props.history.push("/hall")
    }
    // handleDemo(event){
    //     event.preventDefault();
    //     this.props.signIn({username: "user100",password: "hunter2"})
    //     // .this.props.history.push("/hall")
    // }

    // auto demo
    async prettyDemoUser(e) {
        e.preventDefault();
        const demoUser = {
            username: 'demoUser',
            password: 'hunter2'
        };
        const sleep = ms => new Promise(res => setTimeout(res, ms));
        document.getElementById('username-input').focus();
        for (let i = 1; i <= demoUser.username.length; i++) {
            this.setState({ username: demoUser.username.substr(0, i) });
            await sleep(250);
        }
        await sleep(250);
        document.getElementById('password-input').focus();
        for (let i = 1; i <= demoUser.password.length; i++) {
            this.setState({ password: demoUser.password.substr(0, i) });
            await sleep(250);
        }
        await sleep(500);
        document.getElementById('session-submit-btn').click();
        document.getElementById('password-input').blur();
        // await sleep(5000);
        // document.getElementById('logout-btn').click();
    }
// auto demo











    render(){

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
                <form  className="login_form" onSubmit={this.handleSubmit}>
                    <input id="username-input" className="login-input" placeholder="Username" type="text" value={this.state.username} onChange={this.handleInput()}/>
                    <input id="password-input" className="login-input" placeholder="Password" type="password" value={this.state.password} onChange={e => this.setState({ password: e.target.value })}/>
                    <button id="session-submit-btn" className="big-buttion-input" >Log In</button>
                </form>
                <button  onClick={e => this.prettyDemoUser(e)} className="big-buttion-input" >DEMO</button>
                <div className="a1">
                    dont have an account? &nbsp;
                    <Link to="/signUp">click here sign up.</Link>
                </div>
                
                <Footer />
            </div>
        )
    }
}

export default SignIn









