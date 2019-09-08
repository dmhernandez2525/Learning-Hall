import React from "react";
import DropDown from "../dropDownNav/dropDownNavContainer"


class Hall extends React.Component{
    constructor(props){
        super(props)
        this.state = this.props.user
    }

    render(){

            
        return(
            <div>
                <h2>{`Welcome ${this.props.user.username} `}</h2>
            <h2>{`LET THE LEARNING BEGIN `}</h2>
            <DropDown/>
 

            </div>
        )
    }

}
export default Hall