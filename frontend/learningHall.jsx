import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import configureStore from './store/store';
//go back start

//  /home/daniel/Desktop/LearningHall/frontend/reducers/session_reducer.js

// /home/daniel/Desktop/LearningHall/frontend/components/course/courseContainer.js

// /home/daniel/Desktop/LearningHall/frontend/reducers/errors_reducer.js

// /home/daniel/Desktop/LearningHall/frontend/components/profile/profile.jsx
//      add the styling  and the CRUD for task,course,sujbject 

//go back end

document.addEventListener("DOMContentLoaded", () => {
    //useing this logic to bootstrap thhe user in from the backend
    let preloadedState = undefined;

    // checks to see if there is a user on the windoew from the back end 
    // if there is then we are going to set the preloadedState to the session slice of state and
    //give it the user 
    if (window.currentUser){
        preloadedState = {
            session: {
                currentUser: window.currentUser,
                currentTask: "no task"

            }
        };
    };

    // creates the store var and initializes it to configureStore with the preloadedState passed in
    //from  up above 
    const store = configureStore(preloadedState);
    window.getState = store.getState;
   
    // grabing the div that we set in the static page show page to render react into 
    const root = document.getElementById("root")

    // test start here

    // test ends here

    //seting up react to start its initialize proses with a prop of store and being put into
    //the root in the static page show page in app/views/static_pages/root.html.erb
    ReactDOM.render(<App  store={store}/>, root)
})
