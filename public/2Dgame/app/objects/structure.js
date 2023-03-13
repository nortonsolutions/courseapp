import { Component } from "./component.js";

/**
 * The Structure is a four-sided structure with three walls to surround
 */
class Structure extends Component {
  constructor(template, sceneController) {
    super(template, sceneController);
    this.wallWidth = template.wallWidth;
    this.wallColor = template.wallColor;
  }

  build(callback) {
    let response = {
      walls: []
    };

    let wall1 = new Component(
      {
        width: this.width,
        height: this.wallWidth,
        color: this.wallColor,
        x: this.x,
        y: this.y
      },
      this.sceneController
    );
    let wall2 = new Component(
      {
        width: this.wallWidth,
        height: this.height,
        color: this.wallColor,
        x: this.x + this.width,
        y: this.y
      },
      this.sceneController
    );
    let wall3 = new Component(
      {
        width: this.wallWidth,
        height: this.height,
        color: this.wallColor,
        x: this.x,
        y: this.y
      },
      this.sceneController
    );

    response.walls.push(wall1, wall2, wall3);
    callback(response);
  }
}

export { Structure };
