import React from "react";
import ReactDOM from "react-dom";
import App from "./components/app";
import configureStore from "./store/store";
import "./styles/index.css";

declare global {
  interface Window {
    currentUser?: {
      id: number;
      username: string;
      email?: string;
    };
    getState?: () => any;
  }
}

interface PreloadedState {
  session: {
    currentUser: typeof window.currentUser;
    currentTask: string;
  };
}

document.addEventListener("DOMContentLoaded", () => {
  // Using this logic to bootstrap the user in from the backend
  let preloadedState: PreloadedState | undefined = undefined;

  // Checks to see if there is a user on the window from the backend
  // If there is then we are going to set the preloadedState to the session slice of state
  // and give it the user
  if (window.currentUser) {
    preloadedState = {
      session: {
        currentUser: window.currentUser,
        currentTask: "no task",
      },
    };
    (window as any).currentUser = 1;
  }

  // Creates the store var and initializes it to configureStore with the preloadedState passed in
  // from up above
  const store = configureStore(preloadedState);
  window.getState = store.getState;

  // Grabbing the div that we set in the static page show page to render React into
  const root = document.getElementById("root");

  // Setting up React to start its initialize process with a prop of store and being put into
  // the root in the static page show page in app/views/static_pages/root.html.erb
  if (root) {
    ReactDOM.render(<App store={store} />, root);
  }
});
