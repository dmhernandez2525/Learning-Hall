import React from "react";

interface SwitchProps {
  currentPane: string | number;
  updatePain: (pain: number | string) => void;
}

interface SwitchState {
  currentPane: number;
}

class Switch extends React.Component<SwitchProps, SwitchState> {
  constructor(props: SwitchProps) {
    super(props);
    this.state = { currentPane: 1 };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(num: number, id: string): void {
    this.setState({ currentPane: num });

    const elements = ["1", "2", "3"];
    elements.forEach((elId) => {
      const el = document.getElementById(elId);
      if (el) {
        el.classList.remove("switch-to");
      }
    });

    const activeEl = document.getElementById(id);
    if (activeEl) {
      activeEl.classList.add("switch-to");
    }
  }

  render(): React.ReactNode {
    const allImg: Record<number, React.ReactNode> = {
      1: (
        <img
          className="switch-img"
          key={1}
          src={window.logoUrl}
          alt="Learning Hall Logo"
        />
      ),
      2: (
        <img
          className="switch-img"
          key={2}
          src={window.img2Url}
          alt="Learning Hall promotional image 2"
        />
      ),
      3: (
        <img
          className="switch-img"
          key={3}
          src={window.img3Url}
          alt="Learning Hall promotional image 3"
        />
      )
    };

    const currentImage = allImg[this.state.currentPane];

    return (
      <div className="switch" role="tablist" aria-label="Image gallery">
        <section className="splash-switcher">
          <div
            id="1"
            onClick={() => this.handleClick(1, "1")}
            role="tab"
            tabIndex={0}
            aria-selected={this.state.currentPane === 1}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                this.handleClick(1, "1");
              }
            }}
            aria-label="Show image 1"
          >
            <h3>some content</h3>
            <p>put a brief description for this part</p>
          </div>

          <div
            id="2"
            onClick={() => this.handleClick(2, "2")}
            role="tab"
            tabIndex={0}
            aria-selected={this.state.currentPane === 2}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                this.handleClick(2, "2");
              }
            }}
            aria-label="Show image 2"
          >
            <h3>some content</h3>
            <p>put a brief description for this part</p>
          </div>

          <div
            id="3"
            onClick={() => this.handleClick(3, "3")}
            role="tab"
            tabIndex={0}
            aria-selected={this.state.currentPane === 3}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                this.handleClick(3, "3");
              }
            }}
            aria-label="Show image 3"
          >
            <h3>some content</h3>
            <p>put a brief description for this part</p>
          </div>
        </section>
        <div role="tabpanel" aria-label="Selected image">
          {currentImage}
        </div>
      </div>
    );
  }
}

export default Switch;
