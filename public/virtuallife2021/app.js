import { gridToString, prepareGrid, World } from "./app/world.js";
import { WorldAnimator } from "./app/worldAnimator.js";

var app = {
    load() {
        const ROWS = 40;
        const COLS = 60;

        var itemOptions = {
            empty: { 
                symbol: "e", 
                buildChance: 50 
            },
            wall: { 
                symbol: "w", 
                buildChance: 35 
            },
            plant: { 
                symbol: "p", 
                buildChance: 5, 
                ableToMoveOn: ["empty"], 
                ableToEat: [], 
                healthToReproduce: 27, 
                healthToMove: 70 
            },
            herbivore: { 
                symbol: "a", 
                buildChance: 5, 
                ableToMoveOn: ["empty"], 
                ableToEat: ["plant"], 
                plantChance: 10, 
                healthToReproduce: 70, 
                healthToMove: 70 
            },
            carnivore: { 
                symbol: "c", 
                buildChance: 5, 
                ableToMoveOn: ["plant","empty"], 
                ableToEat: ["herbivore","omnivore"], 
                plantChance: 5, 
                vegetarianChance: 20, 
                healthToReproduce: 80, 
                healthToMove: 70 
            },
            omnivore: { 
                symbol: "o", 
                buildChance: 5, 
                ableToMoveOn: ["empty"], 
                ableToEat: ["herbivore","plant"], 
                plantChance: 5, 
                vegetarianChance: 20, 
                healthToReproduce: 73, 
                healthToMove: 70 
            },

        }

        var worldPlan = gridToString(prepareGrid(ROWS,COLS,itemOptions));
 
        var world = new World(worldPlan,itemOptions);
        // animateWorld(world)
        var worldAnimator = new WorldAnimator(world);
        worldAnimator.start();
    }
};


export { app };