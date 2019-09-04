import React from "react";


class Hall extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.user
        debugger
    }

    render(){
        debugger
        return(
            <div>
                <h2>{`Welcome ${this.props.user.username} `}</h2>
            <h2>{`LET THE LEARNING BEGIN `}</h2>
            </div>
        )
    }

}
export default Hall