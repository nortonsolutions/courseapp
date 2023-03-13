import { Hero } from "./entities/hero.js";
import { Enemy } from "./entities/enemy.js";
import { Npc } from "./entities/npc.js";
import { Structure } from "./structure.js";
import { Item } from "./item.js";
import { Component } from "./component.js";

export class ComponentFactory {
  constructor(sceneController) {
    this.sceneController = sceneController;
  }

  build(template, location) {
    switch (template.type) {
      case "enemy":
        this.addEnemy(template, location);
        break;
      case "npc":
        this.addNpc(template, location);
        break;
      case "item":
        this.addItem(template, location);
        break;
      case "structure":
        this.addStructure(template, location);
        break;
      case "hero":
        return this.addHero(template, location);
      case "terrain":
        return this.addComponent(template, location); // location should always be 0,0
    }
  }

  addItem(itemTemplate, location) {
    let item = new Item(itemTemplate, this.sceneController);
    if (location) {
      item.x = location.x;
      item.y = location.y;
    }
    item.build(item => {
      this.sceneController.items.push(item);
      this.sceneController.solids.push(item);
    });
  }

  addStructure(structureTemplate, location) {
    let structure = new Structure(structureTemplate, this.sceneController);
    if (location) {
      structure.x = location.x;
      structure.y = location.y;
    }
    structure.build(response => {
      response.walls.forEach(wall => this.sceneController.solids.push(wall));
    });
    this.sceneController.structures.push(structure);
  }

  addNpc(npcTemplate, location) {
    let npc = new Npc(npcTemplate, this.sceneController);
    if (location) {
      npc.x = location.x;
      npc.y = location.y;
    }
    npc.build(npc => {
      this.sceneController.npcs.push(npc);
      this.sceneController.solids.push(npc);
    });
  }

  addEnemy(enemyTemplate, location) {
    let enemy = new Enemy(enemyTemplate, this.sceneController);
    if (location) {
      enemy.x = location.x;
      enemy.y = location.y;
    }
    enemy.build(enemy => {
      this.sceneController.enemies.push(enemy);
      this.sceneController.solids.push(enemy);
    });
  }

  addHero(heroTemplate, location) {
    let hero = new Hero(heroTemplate, this.sceneController);
    if (location) {
      hero.x = location.x;
      hero.y = location.y;
    }
    return hero;
  }

  addComponent(componentTemplate, location) {
    let component = new Component(componentTemplate, this.sceneController);
    if (location) {
      item.x = location.x;
      item.y = location.y;
    }
    return component;
  }
}
