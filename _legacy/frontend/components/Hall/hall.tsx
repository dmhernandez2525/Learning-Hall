import React from "react";
import DropDown from "../dropDownNav/dropDownNavContainer";
import { compiler } from 'markdown-to-jsx';
import ProfileComponent from "../profile/profileComponent";

interface HallProps {
  currentTask: string;
  receiveTask: (task: string) => void;
}

class Hall extends React.Component<HallProps> {
  private words: string[];

  constructor(props: HallProps) {
    super(props);
    this.words = ["Course", "Subject", "Task", "no task", "Profile"];
  }

  openCloseNav(): void {
    const stateNav = document.getElementById("mySidenav");
    if (!stateNav) return;

    const openNav = (): void => {
      const sidenav = document.getElementById("mySidenav");
      const main = document.getElementById("Main");
      if (sidenav) {
        sidenav.classList.remove("mySidenav");
        sidenav.classList.add("sidenav-togle");
      }
      if (main) {
        main.classList.remove("main-hall-as");
        main.classList.add("move");
      }
    };

    const closeNav = (): void => {
      const sidenav = document.getElementById("mySidenav");
      const main = document.getElementById("Main");
      if (sidenav) {
        sidenav.classList.remove("sidenav-togle");
        sidenav.classList.add("sidenav");
      }
      if (main) {
        main.classList.add("main-hall-as");
        main.classList.remove("move");
      }
    };

    if (stateNav.className === "sidenav") {
      openNav();
    } else {
      closeNav();
    }
  }

  render(): React.ReactNode {
    let text: React.ReactNode;

    if (this.words.includes(this.props.currentTask)) {
      text = <ProfileComponent />;
    } else {
      text = (
        <div className="code-markDown">
          {compiler(this.props.currentTask.toString())}
        </div>
      );
    }

    return (
      <div id="Main" className="main-hall-as color1">
        <div>
          <nav className="the_nav" role="navigation" aria-label="Main navigation">
            <DropDown />

            <header className="hall_nav">
              <section className="color2">
                <button
                  onClick={() => this.openCloseNav()}
                  aria-label="Toggle course outline"
                  aria-expanded="false"
                >
                  Learn
                </button>
                <button
                  onClick={() => this.props.receiveTask("Profile")}
                  aria-label="Go to profile"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    window.open(
                      "https://join.slack.com/t/learninghall/shared_invite/enQtNzUzNzM0NDA1NzE2LTY1ZmFmNzY0NjFhOGVjZTBhMzg1M2RmYjJmOGRjNmYxOGM1OGJiOTIxNDY1NDZmMWE1Mzc3ZDE4ODM4OWNjYjk",
                      "_blank",
                      "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=10500,width=400,height=400"
                    );
                  }}
                  aria-label="Join Slack community"
                >
                  <img src={window.slack} alt="Slack logo" />
                </button>
              </section>
            </header>
          </nav>

          <section className="main_task_part" role="main" aria-label="Task content">
            <div className="main_task_part-first-div">
              <div className="main-hall-task-text">{text}</div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

export default Hall;
