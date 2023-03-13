import { Component } from '../component.js'

class Character extends Component {

    constructor(template, sceneController) {
        super(template, sceneController);
        this.class = template.class;
        this.gender = template.gender;
        this.lvl = template.lvl;

        this.animates = template.animates; // boolean - does the character animate?
        this.images = template.images? template.images.split(',') : null;
        this.frames = template.frames; // if so, how many frames?
        this.cycle = 1;

        this.inventory = {
            // ( itemName: quantity ) 
        };

        this.equipped = {
            head: null,
            handR: null,
            handL: null,
            body: null,
            foot: null
        }

        this.speedX = 0;
        this.speedY = 0;
    }


    healthBar = function() {
        var hitPoints = document.getElementById("myLife");   
        var regain = 1;
        var damage = -1;
        let situation = setInterval(frame, 20);
        function frame() {
          if (regain >= 100) {
            clearInterval(situation);
          } else {
            regain++; 
            hitPoints.style.regain = regain + '%'; 
          }
          if (damage <= 100) {
            clearInterval(situation);
          } else {
            damage++; 
            hitPoints.style.damage = damage + '%'; 
          }
        }
      }
    

    takeItem(itemName) {
        // does the item already exist in inventory?
        // if so, increment the quantity, otherwise add to inventory
        if (this.inventory[itemName] && this.inventory[itemName] > 0) {
            this.inventory[itemName] = this.inventory[itemName] + 1;
        } else {
            this.inventory[itemName] = 1;
        }
    }

    dropItem(itemName) {
        delete this.inventory[itemName];
    }


    
    talkTo(personName) { 
        if (this.friendship[personName] > 0) {
          } else {
            this.friendship[personName] = 1;
        }
    }

    attack(enemyName) {
        if (this.encounterList[enemyName] > 0) {
          } else {
            this.encounterList[enemyName] = 1;
        }
    }

    testCollisions() {
        var collisions = [];
        for (let theSolid of this.sceneController.solids) {
            var myleft = this.x;
            var myright = this.x + this.width;
            var mytop = this.y;
            var mybottom = this.y + this.height;
            var otherleft = theSolid.x;
            var otherright = theSolid.x + theSolid.width;
            var othertop = theSolid.y;
            var otherbottom = theSolid.y + theSolid.height;

            if (
                myright >= otherleft &&
                myleft <= otherleft &&
                ((mybottom >= othertop && mytop <= otherbottom) ||
                    (mybottom >= otherbottom && mytop <= othertop))
            ) {
                collisions.push("right");
            }
            if (
                myleft <= otherright &&
                myright >= otherright &&
                ((mybottom <= otherbottom && mytop >= othertop) ||
                    (mybottom >= otherbottom && mytop <= othertop))
            ) {
                collisions.push("left");
            }

            if (
                mytop <= otherbottom &&
                mybottom >= otherbottom &&
                ((myleft <= otherright && myright >= otherleft) ||
                    (myleft <= otherleft && myright >= otherright))
            ) {
                collisions.push("top");
            }
            if (
                mybottom >= othertop &&
                mytop <= othertop &&
                ((myleft <= otherright && myright >= otherleft) ||
                    (myleft <= otherleft && myright >= otherright))
            ) {
                collisions.push("bottom");
            }
        }
        return collisions;
    };

    update(callback) {

        var collisions = this.testCollisions();
    
        if (collisions.length > 0) {
          collisions.forEach(collision => {
            switch (collision) {
              case "right":
                if (this.speedX > 0) this.speedX = 0;
                break;
              case "left":
                if (this.speedX < 0) this.speedX = 0;
                break;
              case "top":
                if (this.speedY < 0) this.speedY = 0;
                break;
              case "bottom":
                if (this.speedY > 0) this.speedY = 0;
                break;
            }
          });
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Keep in bounds:
        if (this.x <= 0 || this.x >= this.sceneController.terrain.width - this.width) this.x -= this.speedX;
        if (this.y <= 0 || this.y >= this.sceneController.terrain.height - this.height) this.y -= this.speedY;

        var image;
        if ((this.speedX || this.speedY) && this.images.length > 1) {
            // which image to use?  based on the speed x/y of the character
            // e.g. images: "SCfront.png,SCleft.png,SCback.png,SCright.png",

            // console.log(`${this.name} - ${this.speedX},${this.speedY}`);
            if (Math.abs(this.speedX) > Math.abs(this.speedY)) { // left or right
                image = this.speedX >= 0 ? this.images[3] : this.images[1];
            } else { // up or down
                image = this.speedY >= 0 ? this.images[0] : this.images[2];
            }

            this.cycle++;
            this.cycle = this.cycle % Number(this.frames);

            // console.log(`${this.name} - ${this.frames}, ${this.cycle}`); 
        } else {
            image = this.images[0];
        }

        let payload = {
            animates: this.animates,
            frames: this.frames,
            image,
            cycle: this.cycle
        }

        super.update(callback, payload);
    }

    moveup() {
        this.speedY -= 2.35;
    }
        
    movedown() {
        this.speedY += 2.35;
    }
        
    moveleft() {
        this.speedX -= 2.35;
    }
        
    moveright() {
        this.speedX += 2.35;
    }

}

export { Character }