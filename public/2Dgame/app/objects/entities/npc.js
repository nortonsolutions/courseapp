import { Character } from "./character.js";

class Npc extends Character {
  constructor(template, sceneController) {
    super(template, sceneController);
  }

  build(callback) {
    callback(this);
  }
}

export { Npc };
