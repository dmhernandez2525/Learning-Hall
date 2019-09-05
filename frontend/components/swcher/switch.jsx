import React from "react";


class Switch extends React.Component{
    constructor(props){
        super(props)
        this.state = {currentPane: 1}
        this.handleClick = this.handleClick.bind(this)
        debugger

    }

    handleClick(num) {
        debugger
        this.setState({ currentPane: [num]})
    }

    render(){
        let allImg = { 
            1: <img className="switch-img" key={1} src="/assets/main2.png" alt="Learning Hall Logo"></img>,
            2: <img className="switch-img" key={2} src="/assets/DSC100704119.jpg" alt="Learning Hall Logo"></img>,
            3: <img className="switch-img" key={3} src="/assets/Screenshot from 2019-09-04 13-22-55.png" alt="Learning Hall Logo"></img>
        
        }
        let current_image = allImg[Object.values(this.state)[0]]


        debugger

        return(
            <div>
                <section >
                    <div onClick={() => this.handleClick(1)}>
                        <h3>some content</h3>
                        <p>put a bref discription for this part</p>
                    </div>

                    <div onClick={() => this.handleClick(2)} >
                        <h3>some content</h3>
                        <p>put a bref discription for this part</p>
                    </div >

                <div onClick={() => this.handleClick(3)}>
                        <h3>some content</h3>
                        <p>put a bref discription for this part</p>
                    </div>

                </section>
                {current_image}

            </div>
        )
    }
}

export default Switch