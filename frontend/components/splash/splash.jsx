import React from "react";
import { Link } from "react-router-dom";
import Footer from "../footer/footer"
import Switch from "../swcher/switch"

class Splash extends React.Component{
    constructor(props){
        super(props)
    }


    render(){
        return(
            <div className="splash">
                <section className="sec1">
                    <section>
                        <h2>Free Plan</h2>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse feugiat turpis sit amet tincidunt dignissim. Aliquam vestibulum sem mauris, eget bibendum tortor pretium at. Morbi sit amet euismod arcu. Integer ut sodales magna. Vestibulum interdum non ex ut porta. Proin pretium neque vitae neque sagittis, in ultrices magna pellentesque. Proin eleifend sollicitudin ex, consequat imperdiet est. Nunc tincidunt imperdiet sem, nec viverra augue rutrum eget. Pellentesque nec purus vitae ligula rutrum pharetra. Nam nec placerat enim. Nulla turpis nunc, laoreet vitae quam id, ornare vestibulum ligula. Interdum et malesuada fames ac ante ipsum primis in faucibus.

                           Cras euismod facilisis lectus, nec vehicula arcu accumsan in. Vestibulum rhoncus dolor quis tempor tincidunt. Aliquam porttitor orci quam. Vivamus a leo sit amet purus varius maximus non eget augue. Etiam porta turpis non erat blandit, non eleifend tortor vestibulum. Nam vulputate urna ut magna auctor efficitur. Suspendisse tincidunt sem dolor, non vulputate magna luctus quis. Phasellus rhoncus diam libero, a fermentum nisi luctus eu. Phasellus odio magna, scelerisque sed facilisis vitae, facilisis vitae felis.

                           Aliquam euismod dolor eget ligula tempor, eget lacinia ante condimentum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla at vestibulum urna. Morbi eu dolor a urna rutrum suscipit vel vel massa. Pellentesque ultricies, justo eget accumsan pellentesque, urna felis placerat arcu, non sagittis ligula sem sit amet nisi. Mauris interdum urna et mollis sollicitudin. Mauris condimentum augue imperdiet ipsum mollis, et fringilla quam elementum. Fusce malesuada dui quis lacus vestibulum, ut consectetur felis bibendum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vestibulum at iaculis massa, vel mattis velit. Quisque fringilla eleifend velit, ut interdum urna lobortis a. Donec molestie mauris id ultrices consequat. Vestibulum dignissim vel est ac sodales. Mauris et arcu maximus, maximus eros id, tristique enim. Phasellus est lectus, fringilla non erat posuere, auctor mattis lorem.
                        </p>
                    </section>
                </section>
                <Switch />
                <picture>
                    <img className="switch-img-long" src={window.img1Url} alt="Learning Hall Logo" />
                </picture>
                <section className="sec3">
                    <section>
                        <h2 id="plan-school">
                            Choose the right plan for yor school
                        </h2>
                    </section>
                    <section >
                        <table id="plans">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>
                                        <h3>free plan</h3>
                                        <p>all nessisary tools for the online class room</p>
                                        <div>
                                            <Link to="/signUp" className={"reg-buttion"}> select plan</Link>
                                            <Link to="/first-pic"></Link>
                                        </div>
                                    </th>
                                    <th>
                                        <h3>premum tools plan</h3>
                                        <p>adds tools for the quiqist online classroom setup </p>
                                        <div>
                                            <Link to="/signUp" className={"reg-buttion"}> select plan</Link>
                                            <Link to="/second-pic"></Link>
                                        </div>

                                    </th>
                                    <th>
                                        <h3>custermer service plan</h3>
                                        <p>custermer service</p>
                                        <div>
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
                                            price
                                        </span>
                                    </td>
                                    <td>$0</td>
                                    <td>29.99/mounth</td>
                                    <td>
                                        buy full pacig at 25K
                                    </td>
                                </tr>
                                <tr>
                                   <td id='td-no'>
                                        <span  className="no-style">
                                        schudle
                                    </span>
                                    </td> 
                                </tr>
                                <tr>

                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>

                                <td id='td-no'>
                                    <span id='td-no' className="no-style">
                                        Features
                                        </span>
                                </td> 

                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
                                    </td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                    <td><span> yes/no</span></td>
                                </tr>



                                <tr>
                                    <td>
                                        <span>some survice</span>
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
                            <Link to="/signUp"className={"reg-buttion"}>Select Plan</Link>
                            <Link to="???">Learn More</Link>
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
                            <Link to="/signUp"className={"reg-buttion"}>Select Plan</Link>
                            <Link to="???">Learn More</Link>
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
                            <Link to="/signUp"className={"reg-buttion"}>Select Plan</Link>
                            <Link to="???">Learn More</Link>
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
                        <h2>plan 2</h2>
                        <p>
                           Cras euismod facilisis lectus, nec vehicula arcu accumsan in. Vestibulum rhoncus dolor quis tempor tincidunt. Aliquam porttitor orci quam. Vivamus a leo sit amet purus varius maximus non eget augue. Etiam porta turpis non erat blandit, non eleifend tortor vestibulum. Nam vulputate urna ut magna auctor efficitur. Suspendisse tincidunt sem dolor, non vulputate magna luctus quis. Phasellus rhoncus diam libero, a fermentum nisi luctus eu. Phasellus odio magna, scelerisque sed facilisis vitae, facilisis vitae felis.
                        </p>
                    </section>
                    <picture>
                        <img className="bottem-img" src={window.img2Url} alt="Learning Hall Logo" />
                    </picture>
                    <Link className={"reg-buttion"} to="???">idk yes</Link>
                </section>
                <section className="sec6">
                    <section>
                        <h2>plan 3</h2>
                        <p>
                            Cras euismod facilisis lectus, nec vehicula arcu accumsan in. Vestibulum rhoncus dolor quis tempor tincidunt. Aliquam porttitor orci quam. Vivamus a leo sit amet purus varius maximus non eget augue. Etiam porta turpis non erat blandit, non eleifend tortor vestibulum. Nam vulputate urna ut magna auctor efficitur. Suspendisse tincidunt sem dolor, non vulputate magna luctus quis. Phasellus rhoncus diam libero, a fermentum nisi luctus eu. Phasellus odio magna, scelerisque sed facilisis vitae, facilisis vitae felis.
                        </p>
                    </section>
                    <picture>
                        <img className="bottem-img"  src={window.img3Url} alt="Learning Hall Logo" />
                    </picture>
                    <section>
                        <h3>apply now for somthing</h3>
                        <section id="almost-done">
                            <label >some date
                                <h3>info</h3>
                            </label>
                            <label >some date
                                <h3>info</h3>
                            </label>
                            <label >some date
                                <h3>info</h3>
                            </label>
                        </section>

                    </section>
                    <Link className={"reg-buttion"} to="???">apply now</Link>
                </section>
                <Footer />






























            </div>
        )
    }
}


export default Splash 