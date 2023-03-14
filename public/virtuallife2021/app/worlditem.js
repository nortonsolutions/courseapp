import { chance, getRndInteger, randomChance } from './lib/math.js';

class WorldItem {

    constructor(args) {
        this.type = args.type;
        this.symbol = args.symbol;
        this.latitude = args.latitude;
        this.longitude = args.longitude;
        this.change = true;
    }

    act() {}
    
    // // SYNTAX for binding 'this':
    // reproduceBound = this.reproduce.bind ( this );
    // reproduce(movement, world) {
    // }
}

class LivingWorldItem extends WorldItem {

    constructor(args) {
        super(args);
        this.ableToMoveOn = args.ableToMoveOn;
        this.ableToEat = args.ableToEat;
        this.healthToReproduce = args.healthToReproduce;
        this.healthToMove = args.healthToMove;
        this.health = args.health ? args.health : 100;
    }

    act(world) {

        this.health -= 1;
        let alive = (this.health > 0);
        if (alive) {
            if (this.health > this.healthToReproduce) {
                // console.log("copying")
                this.health = this.health * .9;
                world.copy(possibleMovements[getRndInteger(0,7)], this);
            }
            if (this.health > this.healthToMove) {
                // console.log("moving")
                this.health = this.health * .9;
                world.move(possibleMovements[getRndInteger(0,7)], this);
            }

            if (Math.abs(this.health-this.healthPrevious)>25) {
                this.change = true;
            } else {
                // console.log(this.health + " " + this.healthPrevious);
            }

        } else {
            world.remove(this);
        }
    }

}

class Plant extends LivingWorldItem {
    constructor(args) {
        super(args);
    }

    act(world) {
        this.change = false;
        this.healthPrevious = this.health;

        if (randomChance()) {
            this.health += 1;
        } else this.health -= 1;
        super.act(world);
    }
}

class Herbivore extends LivingWorldItem {
    constructor(args) {
        super(args);
        this.plantChance = args.plantChance;
    }

    act(world) {
        this.change = false;
        this.healthPrevious = this.health;
        
        if (this.health > this.healthToMove/5) {
            if (world.eat(possibleMovements[getRndInteger(0,7)], this)) {
                this.health += this.health * .3;
            };
        }

        if (chance(this.plantChance)) {
            world.plant(possibleMovements[getRndInteger(0,7)], this);
        }

        super.act(world);
    }
}

class Carnivore extends Herbivore {
    constructor(args) {
        super(args);
        this.vegetarianChance = args.vegetarianChance;
    }

    act(world) {
        // ...
        super.act(world);
    }
}

class Omnivore extends Herbivore {
    constructor(args) {
        super(args);
        this.vegetarianChance = args.vegetarianChance;
    }

    act(world) {
        // ...
        super.act(world);
    }
}


var possibleMovements = [
    [-1,-1],
    [-1,0],
    [-1,1],
    [0,-1],
    [0,1],
    [1,-1],
    [1,0],
    [1,1]
];


export { WorldItem, Plant, Herbivore, Carnivore, Omnivore };