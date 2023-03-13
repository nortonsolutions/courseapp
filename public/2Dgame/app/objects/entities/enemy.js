import { Character } from "./character.js";

class Enemy extends Character {
  constructor(template, sceneController) {
    super(template, sceneController);
  }

  build(callback) {
    callback(this);
  }
}

export { Enemy };
