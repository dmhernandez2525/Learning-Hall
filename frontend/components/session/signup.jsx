import React from "react"

// debugger
class SignUp extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.props.user
        this.handleSumbit = this.handleSumbit.bind(this)
    }

    handleInput(type){
        return (e) => {
            this.setState({[type]: e.target.value})
        } 
    }  

    handleSumbit(event){
        event.preventDefult
        this.props.signUp(this.state)
        // .then(this.props.history.push("/profile"))~~~~this will be addid when the hash router is addid
    }


    render(){
        return (
            <div className="sign_up_form">

                <h2> Sign Up </h2>

                <form  onSubmit={this.handleSumbit}>
                    <label >Username
                        <input 
                        type="text"
                        value={this.state.username}
                        onChange={e => this.handleInput("username") } 
                        />
                    </label>

                    <label >Email
                        <input 
                        type="text"
                        value={this.state.email}
                        onChange={e => this.handleInput("email")}
                            />
                    </label>

                    <label >Preferred_name
                        <input 
                        type="text"
                        value={this.state.preferred_name}
                        onChange={e => this.handleInput("preferred_name")}
                        />
                    </label>

                    <label >Password
                        <input 
                        type="password"
                        value={this.state.password}
                        onChange={e => this.handleInput("password")}
                        />
                    </label>

                    <label >User_role
                        <input 
                        type="text"
                        value={this.state.user_role}
                        onChange={e => this.handleInput("user_role")}
                        />
                    </label>

                    <label >Pronunciation
                        <input 
                        type="text"
                        value={this.state.pronunciation}
                        onChange={e => this.handleInput("pronunciation")}
                        />

                    </label>
                    <button className="sign_up_buttion"> Sign Up</button>
                </form>
            </div>

        )
    }
};



export default SignUp;