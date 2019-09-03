import React from "react"

debugger
class SignUp extends React.Component {
    constructor(props) {
        supper(props)
        this.state
        this.handleSumbit = this.handleSumbit.bind(this)
    }

    handleSumbit(event){
        event.preventDefult
    }


    render(){
        return (
            <form onSubmit={this.handleSumbit}>
                <label >Username
                    
                </label>

                <label >Email

                </label>

                <label >Preferred_name

                </label>

                <label >Password

                </label>

                <label >User_role

                </label>

                <label >Pronunciation

                </label>
            </form>









            <div className="signUp">
                <h2> Hello from the sign Up Page</h2>
            </div>
        )
    }
};



export default SignUp;