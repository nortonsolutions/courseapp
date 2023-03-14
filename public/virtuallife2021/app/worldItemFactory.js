
import { WorldItem, Plant, Herbivore, Carnivore, Omnivore } from './worlditem.js';

/**
 * worldItemFactory object will build new world items.
 * The World will ask the World Item Factory to create WorldItems, so that it
 * can fill its data grid structure.  The World knows which kind of objects 
 * it wants to create and where it wants each one, but the Factory will add 
 * some additional details before returning a complete object.
*/

class WorldItemFactory { 

    constructor(itemOptions, symbolTable) {
        this.itemOptions = itemOptions;
        this.symbolTable = symbolTable;
    }

    build(type,latitude,longitude,health = 100) {

        let args = {
            latitude: latitude,
            longitude: longitude,
            type: type,
            health: health,
            ...this.itemOptions[type]
        }

        switch (type) {
            case "plant":
                return new Plant(args);
            case "herbivore":
                return new Herbivore(args);
            case "carnivore":
                return new Carnivore(args);
            case "omnivore":
                return new Omnivore(args);
            default:
                return new WorldItem(args);
        }

    }

    buildFromSymbol (symbol,latitude,longitude,health) {
        return this.build(this.symbolTable[symbol],latitude,longitude,health);
    }
}

export { WorldItemFactory };