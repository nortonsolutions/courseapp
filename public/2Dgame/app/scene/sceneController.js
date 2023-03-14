import { itemTemplates } from "../objects/blueprints/items.js";
import { structureTemplates } from "../objects/blueprints/structures.js";
import { enemyTemplates } from "../objects/blueprints/enemies.js";
import { npcTemplates } from "../objects/blueprints/npcs.js";
import { heroTemplate } from "../objects/blueprints/hero.js";
import { levelTemplates } from "../objects/blueprints/levels.js"

import { ComponentFactory } from '../objects/componentFactory.js';

class SceneController {
  constructor(eventDepot, levelNumber = 1) {

    this.componentFactory = new ComponentFactory(this);
    this.allTemplates = { ...itemTemplates, ...structureTemplates, ...enemyTemplates, ...npcTemplates }

    this.levelTemplate = levelTemplates[levelNumber];
    this.eventDepot = eventDepot;
    this.canvas = document.getElementById("gameBox");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    this.updateWorld = this.updateWorld.bind(this);

    this.components = [];

    this.structures = [];
    this.solids = [];
    this.items = [];

    this.npcs = [];
    this.hero = [];
    this.enemies = [];

    this.messageShowingEnemy = false;
    this.messageShowingNPC = false;
    this.messageShowingItem = false;
    
    this.terrainImg = document.createElement("img");
    this.terrainImg.src = `assets/images/${this.levelTemplate.name}/${this.levelTemplate.terrain.image}`;

  }

  start() {
    this.setupLevel(this.level);

    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(this.updateWorld, 10);

    window.addEventListener("keydown", e => {
      if (this.hero) this.hero.keydown(e);
    });

    window.addEventListener("keyup", e => {
      if (this.hero) this.hero.keyup(e);
    });

    // TODO: add listener for window resize; adjust canvas width/height
  }

  setupLevel() {
    
    // Add terrain/structure elements first
    // This would be a good place for the form factory
    
    this.terrain = this.componentFactory.build(this.levelTemplate.terrain);
    this.hero = this.componentFactory.build(heroTemplate, { x: 40, y: 100 });
    
    let levelComponents = [
      ...this.levelTemplate.structures,
      ...this.levelTemplate.enemies,
      ...this.levelTemplate.npcs,
      ...this.levelTemplate.items
    ]

    levelComponents.forEach(({name, location}) => {
      this.componentFactory.build(this.getTemplateByName(name), location);
    });

  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  updateWorld() {
    this.clear();

    // iterate through all my objects, grab their details for ctx update
    this.components.forEach(component => {
      
      component.update(c => {
        this.context.save();

        if (c.image) {
          if (!c.cycle) c.cycle = 0;

          var img;
          if (c.type.match(/terrain/)) {
            img = this.terrainImg;            
          } else {
            img = document.createElement("img");
            img.src = `assets/images/${c.name}/${c.image}`;
          }
          // console.log(`${c.name} - ${c.x},${c.y} ${c.image}`)
          this.context.drawImage(img, c.cycle * c.width, 0, c.width, c.height, c.x - this.hero.xOffset, c.y - this.hero.yOffset, c.width, c.height);
          
        } else {
          this.context.fillStyle = c.color;
          this.context.fillRect(c.x - this.hero.xOffset, c.y - this.hero.yOffset, c.width, c.height);
        }

        this.context.restore();

      });
    });
  }

  getTemplateByName(name) {
    return this.allTemplates[name];
  }

  removeFromScene(item) {
    this.components = this.components.filter(el => el != item);
    this.items = this.items.filter(el => el != item);
    this.solids = this.solids.filter(el => el != item);
  }

  addItem(template, location) {
    this.componentFactory.addItem(template, location);
  }

}

export { SceneController };
