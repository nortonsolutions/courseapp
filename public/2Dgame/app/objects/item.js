import { Component } from "./component.js";

class Item extends Component {
  constructor(template, sceneController) {
    super(template, sceneController);
  }

  build(callback) {
    callback(this);
  }
}
export { Item };
