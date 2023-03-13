import { Character } from "./character.js";

class Hero extends Character {
  constructor(template, sceneController) {
    super(template, sceneController);
    this.addEventListeners();
    this.keys = [];

    this.xOffset = 0; this.yOffset = 0;
    
  }

  addEventListeners() {
    this.sceneController.eventDepot.addListener('dropItemToScene', (itemName) => {
      // add back to canvas at my location, and reduce inventory
      this.sceneController.addItem(
        this.sceneController.getTemplateByName(itemName),
        { x: this.x, y: this.y - 10 }
      );
      this.dropItem(itemName);
    })
  }

  update(callback) {
    var closestItem = this.testItems();
    var closestPerson = this.testPerson();
    var closestEnemy = this.testEnemy();

    this.speedX = 0;
    this.speedY = 0;

    //walk
    if (this.keys && this.keys[37]) {
      this.moveleft();
    }
    if (this.keys && this.keys[39]) {
      this.moveright();
    }
    if (this.keys && this.keys[38]) {
      this.moveup();
    }
    if (this.keys && this.keys[40]) {
      this.movedown();
    }

    // grab - g
    if (this.keys && this.keys[71] && closestItem) {
      // add to inventory
      this.takeItem(closestItem.toString());

      // remove from scene
      this.sceneController.removeFromScene(closestItem);
    }

    // talk - t
    if (this.keys && this.keys[84] && closestPerson) {
    }

    // Attack - spacebar
    if (this.keys && this.keys[32]) {
      this.attack(closestEnemy.toString());
    }

    // Inventory - i
    if (this.keys && this.keys[73]) {
      this.sceneController.eventDepot.fire('modal', { type: 'inventory', title: 'Inventory', context: this.inventory });
    }

    // xOffset
    // max xOffset = this.sceneController.terrain.width - this.sceneController.canvas.width/2
    if (this.x >= this.sceneController.terrain.width - this.sceneController.canvas.width/2) { 
      this.xOffset = this.sceneController.terrain.width - this.sceneController.canvas.width;
    } else if (this.x > this.sceneController.canvas.width/2) {
      this.xOffset = this.x - this.sceneController.canvas.width/2;
    } else {
      this.xOffset = 0;
    }

    // yOffset
    // max yOffset = this.sceneController.terrain.height - this.sceneController.canvas.height/2
    if (this.y >= this.sceneController.terrain.height - this.sceneController.canvas.height/2) { 
      this.yOffset = this.sceneController.terrain.height - this.sceneController.canvas.height;
    } else if (this.y > this.sceneController.canvas.height/2) {
      this.yOffset = this.y - this.sceneController.canvas.height/2;
    } else {
      this.yOffset = 0;
    }

    super.update(callback);
  }

  keydown(e) {
    this.keys = this.keys || [];
    this.keys[e.keyCode] = true;
  }

  keyup(e) {
    this.keys[e.keyCode] = false;
  }
  //This tests for nearby objects.
  testItems() {
    for (let item of this.sceneController.items) {
      // console.log(`this: ${this.x},${this.y}... item: ${item.x},${item.y}`);
      // What is the position of the item? How close is it?
      var dx = Math.abs(this.midpoint().x - item.midpoint().x);
      var dy = Math.abs(this.midpoint().y - item.midpoint().y);

      // x^2 + y^2 = d^2
      var distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      if (distance < 60) {
        //display a message on the screen with the item's name (item.toString())
        this.sceneController.eventDepot.fire('showMessage', { type: "item", message: "Item: " + item.toString()});
        return item;
      } else {
        if (this.sceneController.messageShowingItem) this.sceneController.eventDepot.fire('hideMessage');
        return null;
      }
    }
  }

  testPerson() {
    for (let npc of this.sceneController.npcs) {
      var dx = Math.abs(this.midpoint().x - npc.midpoint().x);
      var dy = Math.abs(this.midpoint().y - npc.midpoint().y);

      var vision = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      if (vision < 60) {
        this.sceneController.eventDepot.fire('showMessage', { type: "npc", message: "NPC: " + npc.toString()});
        return npc;
      } else {
        if (this.sceneController.messageShowingNPC) this.sceneController.eventDepot.fire('hideMessage');
        return null;
      }
    }
  }

  testEnemy() {
    for (let enemy of this.sceneController.enemies) {
      var dx = Math.abs(this.midpoint().x - enemy.midpoint().x);
      var dy = Math.abs(this.midpoint().y - enemy.midpoint().y);

      var Vision = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      if (Vision < 60) {
        this.sceneController.eventDepot.fire('showMessage', { type: "enemy", message: "Enemy: " + enemy.toString()});
        return enemy;
      } else {
        if (this.sceneController.messageShowingEnemy) this.sceneController.eventDepot.fire('hideMessage');
        return null;
      }
    }
  }
}

export { Hero };
