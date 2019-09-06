import React from "react";


class Switch extends React.Component{
    constructor(props){
        super(props)
        this.state = {currentPane: 1}
        this.handleClick = this.handleClick.bind(this)

    }

    handleClick(num,id) {
        this.setState({ currentPane: [num]})
        let a = document.getElementById(id)
        a.classList.toggle("switch-to")
    }

    render(){
        let allImg = { 
            1: <img className="switch-img" key={1} src={window.logoUrl} alt="Learning Hall Logo"></img>,
            2: <img className="switch-img" key={2} src={window.img2Url} alt="Learning Hall Logo"></img>,
            3: <img className="switch-img" key={3} src={window.img3Url} alt="Learning Hall Logo"></img>
        
        }
        let current_image = allImg[Object.values(this.state)[0]]



        return(
            <div className="switch">
                <section >
                    <div id="1" onClick={() => this.handleClick(1,"1")}>
                        <h3>some content</h3>
                        <p>put a bref discription for this part</p>
                    </div>

                    <div id="2" onClick={() => this.handleClick(2,"2")} >
                        <h3>some content</h3>
                        <p>put a bref discription for this part</p>
                    </div >

                <div  id="3" onClick={() => this.handleClick(3,"3")}>
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