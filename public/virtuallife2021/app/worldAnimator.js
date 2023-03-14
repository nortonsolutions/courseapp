import { WorldView } from "./worldView.js";

class WorldAnimator {

    constructor(world) {
        this.interval = 35;
        this.world = world;
        this.worldView = new WorldView(this.world.toStringGrid(),this.interval);
    }

    start() {
        this.generation = 0;

        window.setInterval(() => { 
            
            if (! this.worldView.paused) {
                this.generation += 1;
                let beforeTurn = new Date();
                this.world.turn();
                this.turnTime = new Date() - beforeTurn; 
                this.worldView.render(this.world.toStringGrid(),
                {
                    interval: this.interval,
                    generation: this.generation,
                    turnTime: this.turnTime
                });
            }
        }, this.interval);
    }
}

export { WorldAnimator }