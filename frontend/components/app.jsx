import React from "react"
import SignUpContainer from "../components/session/signup_container"
import provider
class App extends React.Component{




    render()
    {
        return(
            <div>
                <h1>Hello World</h1>
                <SignUpContainer/>
            </div>
        )
    }

}

export default App