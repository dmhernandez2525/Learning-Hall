import React from "react";
import { Link } from "react-router-dom";
import Footer from "../footer/footer"
import Switcher from "../swcher/switchContaner"

class Splash extends React.Component{
    constructor(props){
        super(props)
    }


    render(){
        return(
            <div className="splash">
                <section className="sec1">
                    <section>
                        <h2 className="free-plan">Free Plan</h2>
                        <p></p>
                    </section>
                </section>
                <Switcher />
                <picture>
                    <img className="switch-img-long" src={window.img1Url} alt="Learning Hall Logo" />
                </picture>
                <section className="sec3">
                    <section>
                        <h2 id="plan-school">
                            Choose the right plan for your school
                        </h2>
                    </section>
                    <section >
                        <table id="plans">
                            <thead>
                                <tr className="why">
                                    <th></th>
                                    <th className="after-thought">
                                        <h3>Free plan</h3>
                                        <p>all necessary tools for the online classroom</p>
                                        <div className="buttion-th">
                                            <Link to="/signUp" className={"reg-buttion"}> select plan</Link>
                                            <Link to="/first-pic"></Link>
                                        </div>
                                    </th>
                                    <th className="after-thought">
                                        <h3>Premium tools plan</h3>
                                        <p>adds tools for the quickest online classroom setup</p>
                                        <div className="buttion-th">
                                            <Link to="/signUp" className={"reg-buttion"}> select plan</Link>
                                            <Link to="/second-pic"></Link>
                                        </div>

                                    </th>
                                    <th className="after-thought">
                                        <h3>Customer service plan</h3>
                                        <p>Customer service</p>
                                        <div className="buttion-th">
                                            <Link to="/signUp" className={"reg-buttion"}> select plan</Link>
                                            <Link to="/thred-pic"></Link>
                                        </div>

                                    </th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id='td-no'>
                                        <span id='td-no' className="no-style">
                                            priceing options
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span>
                                            Price
                                        </span>
                                    </td>
                                    <td>$0</td>
                                    <td>29.99/mounth</td>
                                    <td>
                                        Buy full package for 25K
                                    </td>
                                </tr>
                                <tr>
                                   <td id='td-no'>
                                        <span  className="no-style">
                                        Schedule
                                    </span>
                                    </td> 
                                </tr>
                                <tr>

                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>

                                <tr >
                                    <td id='td-no'>
                                        <span id='td-no' className="no-style">
                                            Features
                                        </span>
                                    </td>

                                </tr> 

                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>Some Service</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>




                            </tbody>
                        </table>

                    </section>
                </section>
                <section className="sec4">
                    <section className="white">
                        <header>
                            <h3>the plan name</h3>
                            <p>a breff discription of said corse</p>
                            <Link to="/signup"className={"reg-buttion"}>Select Plan</Link>
                            <Link to="/signup">Learn More</Link>
                        </header>
                        <ul>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                        </ul>
                    </section>
                    <section className="gray">
                        <header>
                            <h3>the plan name</h3>
                            <p>a breff discription of said corse</p>
                            <Link to="/signup"className={"reg-buttion"}>Select Plan</Link>
                            <Link to="/signup">Learn More</Link>
                        </header>
                        <ul>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                        </ul>
                    </section>
                    <section className="white">
                        <header>
                            <h3>the plan name</h3>
                            <p>a breff discription of said corse</p>
                            <Link to="/signup"className={"reg-buttion"}>Select Plan</Link>
                            <Link to="/signup">Learn More</Link>
                        </header>
                        <ul>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                            <li>detail about plan</li>
                        </ul>
                    </section>
                </section>
                <section className="sec5">
                    <section>
                        <h2>Plan 2</h2>
                        <p></p>
                    </section>
                    <picture>
                        <img className="bottem-img" src={window.img2Url} alt="Learning Hall Logo" />
                    </picture>
                    <Link className={"reg-buttion"} to="/signup">Choose this plan</Link>
                </section>
                <section className="sec6">
                    <section>
                        <h2>Plan 3</h2>
                        <p></p>
                    </section>
                    <picture>
                        <img className="bottem-img"  src={window.img3Url} alt="Learning Hall Logo" />
                    </picture>
                    <section className="bottem-apply">
                        <h3>Apply Now</h3>
                        <section id="almost-done">
                            <label className="bottom-apply-part">some date
                                <h3>info</h3>
                            </label >
                            <label className="bottom-apply-part">some date
                                <h3>info</h3>
                            </label >
                            <label className="bottom-apply-part">some date
                                <h3>info</h3>
                            </label>
                        </section>

                    </section>
                    <Link className={"reg-buttion"} to="/signup">Apply Now</Link>
                </section>
                {/* <Footer /> */}
            </div>
        )
    }
}


export default Splash 