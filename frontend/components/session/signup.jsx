import React from "react";
import { Link } from "react-router-dom";
import Footer from "../footer/footer"


class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.user;
        this.handleSumbit = this.handleSumbit.bind(this);
    };

    handleInput(type) {
        return (e) => {
            this.setState({ [type]: e.target.value });
        };
    };
    componentWillUnmount() {
        this.props.clearErrors()
    }

    handleSumbit(event) {
        event.preventDefault();

        this.props.signUp(this.state)
        // .then(this.props.history.push("/hall"))
    };


    render() {

        let errors = this.props.errors.map(e => {
            return (
                <li className="errors">{e}</li>
            )
        })
        let Errors;
        if (this.props.errors.length){
            Errors = <ul >{errors}</ul>
        }else{
            Errors = <ul className="has-no-errors">{errors}</ul>

        }

        return (
            <div className="sign_up_in_div">


                {Errors}
                {/* <div className="g-signin2" data-width="400" data-height="40px" data-longtitle="true" data-onsuccess="onSignIn"></div> */}

                <form className="auth_form" onSubmit={this.handleSumbit}>
                    <div className="auth_form_top">                    
                        <h2 > Sign up to start Learning </h2>
                        <h3 > Create your account </h3>

                    </div>

                 
                    <input
                        className="auth-big-input"
                        type="text"
                        value={this.state.username}
                        placeholder="Username"
                        onChange={this.handleInput("username")}
                    />
                    {/* </label> */}

                    {/* <label >Email */}
                    <input
                        className="auth-big-input"
                        type="email"
                        value={this.state.email}
                        placeholder="Email"
                        onChange={this.handleInput("email")}
                    />
                    
                    <input
                        className="auth-big-input"
                        type="password"
                        value={this.state.password}
                        placeholder="Password"
                        onChange={this.handleInput("password")}
                    />                   
                    
                    <div className="sign_up_in_div_input">
                        <input
                            className="auth-big-input-split"
                            type="text"
                            value={this.state.preferred_name}
                            placeholder="Preferred Name"
                            onChange={this.handleInput("preferred_name")}
                        />

                        <input
                            className="auth-big-input-split"
                            type="text"
                            value={this.state.pronunciation}
                            placeholder="Pronunciation"
                            onChange={this.handleInput("pronunciation")}
                        />
                    </div>




                    <input
                        className="auth-big-input"
                        type="text"
                        value={this.state.user_role}
                        placeholder="User Role"
                        onChange={this.handleInput("user_role")}
                    />

                    {/* </label> */}
                    {/* <label > */}
                    <input className="big-buttion-auth" type="submit" value={"Continue"} />
                    {/* </label> */}
                    <div className="a1">
                        Allready have an account? &nbsp;
                        <Link to="/signIn">click here to login.</Link>






                    </div>

                </form>

                {/* <Footer/> */}

            </div>

        )
    };
};



export default SignUp;










/* <html>
<head>
  <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css">
  <script src="https://apis.google.com/js/api:client.js"></script>
  <script>
  var googleUser = {};
  var startApp = function() {
    gapi.load('auth2', function(){
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      auth2 = gapi.auth2.init({
        client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
        // Request scopes in addition to 'profile' and 'email'
        //scope: 'additional_scope'
      });
      attachSignin(document.getElementById('customBtn'));
    });
  };

  function attachSignin(element) {
    console.log(element.id);
    auth2.attachClickHandler(element, {},
        function(googleUser) {
          document.getElementById('name').innerText = "Signed in: " +
              googleUser.getBasicProfile().getName();
        }, function(error) {
          alert(JSON.stringify(error, undefined, 2));
        });
  }
  </script>
  <style type="text/css">
    #customBtn {
      display: inline-block;
      background: white;
      color: #444;
      width: 190px;
      border-radius: 5px;
      border: thin solid #888;
      box-shadow: 1px 1px 1px grey;
      white-space: nowrap;
    }
    #customBtn:hover {
      cursor: pointer;
    }
    span.label {
      font-family: serif;
      font-weight: normal;
    }
    span.icon {
      background: url('/identity/sign-in/g-normal.png') transparent 5px 50% no-repeat;
      display: inline-block;
      vertical-align: middle;
      width: 42px;
      height: 42px;
    }
    span.buttonText {
      display: inline-block;
      vertical-align: middle;
      padding-left: 42px;
      padding-right: 42px;
      font-size: 14px;
      font-weight: bold;
     // Use the Roboto font that is loaded in the <head> 
font - family: 'Roboto', sans - serif;
    }
  </style >
  </head >
    <body>
        
  <div id="gSignInWrapper">
            <span class="label">Sign in with:</span>
            <div id="customBtn" class="customGPlusSignIn">
                <span class="icon"></span>
                <span class="buttonText">Google</span>
            </div>
        </div>
        <div id="name"></div>
        <script>startApp();</script>
    </body>
</html >
*/