/** Virtual World Project #4
    Written by: Dave Norton @ 2021 */

import { WorldItemFactory } from './worldItemFactory.js';
import { chance } from './lib/math.js';

/**
 * 
 * The World will ask the World Item Factory to create WorldItems, so that it 
 * can fill its data grid structure.  The World knows which kind of objects 
 * it wants to create and where it wants each one, but the Factory will add 
 * some additional details before returning a complete object.
 * 
 */

class World {

    constructor(worldPlanString, itemOptions) {

        this.living = 0;
        this.itemOptions = itemOptions;
        this.symbolTable = {};
        for (let type in itemOptions) {
            let symbol = itemOptions[type].symbol;
            this.symbolTable[symbol] = type;
        }

        this.worldItemFactory = new WorldItemFactory(this.itemOptions, this.symbolTable);

        this.worldPlanString = worldPlanString;
        this.gridString = parseWorldPlanString (worldPlanString);
        this.grid = [this.gridString.length];
        
        this.gridString.forEach((row,rowNumber) => {
            this.grid[rowNumber] = [this.gridString[rowNumber].length];
            row.forEach((element,colNumber) => {
                this.grid[rowNumber][colNumber] = this.worldItemFactory.buildFromSymbol(element,rowNumber,colNumber);                
            });
        });
    }

    turn() {
        this.living = 0;
        this.grid.forEach((row) => {
            row.forEach((item) => {
                item.act(this);
                if (item.type != "empty" && item.type != "wall") this.living++;
            });
        });
    }

    // Try to eat at the given location.
    eat(movement, sourceWorldItem) {
        
        var { targetRow, targetCol } = this.revolve(sourceWorldItem.latitude+movement[0],sourceWorldItem.longitude+movement[1]);

        var targetCell = this.grid[targetRow][targetCol];
        if (sourceWorldItem.ableToEat.includes(targetCell.type)) {
            // console.log("Eating: " + sourceWorldItem.type + " @ " + sourceWorldItem.latitude + "," + sourceWorldItem.longitude + " " + targetRow + "," + targetCol);
            this.grid[targetRow][targetCol].health -= this.grid[targetRow][targetCol].health * .5;
            return true;
         
        } else return false;
    
    }

    // Try to plant at the given location.
    plant (movement, sourceWorldItem) {
    
        var { targetRow, targetCol } = this.revolve(sourceWorldItem.latitude+movement[0],sourceWorldItem.longitude+movement[1]);

        var targetCell = this.grid[targetRow][targetCol];
        if (sourceWorldItem.ableToMoveOn.includes(targetCell.type)) {
            // console.log("Planting: " + sourceWorldItem.type + " @ " + sourceWorldItem.latitude + "," + sourceWorldItem.longitude + " " + targetRow + "," + targetCol);
            this.grid[targetRow][targetCol] = this.worldItemFactory.build("plant",targetRow,targetCol);
            return true;
            
        } else return false;
    
    }

    // Copy the source world item to the given location.
    copy(movement, sourceWorldItem) {
        
        var { targetRow, targetCol } = this.revolve(sourceWorldItem.latitude+movement[0],sourceWorldItem.longitude+movement[1]);
        
        var targetCell = this.grid[targetRow][targetCol];
        if (sourceWorldItem.ableToMoveOn.includes(targetCell.type)) {

            // console.log("Copying " + sourceWorldItem.type + " @ " + sourceWorldItem.latitude + "," + sourceWorldItem.longitude + " " + targetRow + "," + targetCol);

            if (sourceWorldItem.type == "carnivore" && chance(sourceWorldItem.vegetarianChance)) {
                this.grid[targetRow][targetCol] = this.worldItemFactory.build("herbivore",targetRow,targetCol,sourceWorldItem.health);
            } else {
                this.grid[targetRow][targetCol] = this.worldItemFactory.build(sourceWorldItem.type,targetRow,targetCol,sourceWorldItem.health);
            }

            return true;
        } else return false;
    }
 

    // Move the source world item to the location of the target world item.
    move(movement, sourceWorldItem) {
        if (this.copy(movement,sourceWorldItem)) this.remove(sourceWorldItem);
    }
 
    // Remove the world item and replace it with an empty space.
    remove(worldItem) {
        this.grid[worldItem.latitude][worldItem.longitude] = this.worldItemFactory.build("empty", worldItem.latitude, worldItem.longitude)
        // console.log("Removing " + worldItem.type + " @ " + worldItem.latitude + "," + worldItem.longitude);
    }

    toString() {

        var returnString = "";
        this.grid.forEach(row => {
            row.forEach(element => {
                returnString += element.symbol;
            });
            returnString += "\n"
        });
        
        return returnString;
    }

    toStringGrid() {

        let stringGrid = [];
        this.grid.forEach((row,rowNumber) => {
            stringGrid.push([]);
            row.forEach(element => {
                stringGrid[rowNumber].push({symbol: element.symbol, health: element.health, change: element.change });
            });
        });
        return stringGrid;
    }

    // Compensates for the edges of the map
    revolve(targetRow, targetCol) {
    
        if (targetRow == 0) {
            targetRow = this.grid.length-2;
        } else if (targetRow == this.grid.length-1) {
            targetRow = 1;
        }
    
        if (targetCol == 0) {
            targetCol = this.grid[0].length-2;
        } else if (targetCol == this.grid[0].length-1) {
            targetCol = 1;
        }

        return { targetRow, targetCol }
    }


};

function parseWorldPlanString (worldPlanString) {

    var worldRows = worldPlanString.split("\n");
    var grid = [worldRows.length];    
    worldRows.forEach((row,rowNumber) => {
        grid[rowNumber] = [];
        let worldItems = row.split("");
        worldItems.forEach((item,colNumber) => {
            grid[rowNumber][colNumber] = item;
        });
    });
    return grid;
}

function prepareGrid(ROWS,COLS,itemOptions) {
    
    let myGrid = [];
    // Initialize a world grid based on ROWS and COLS above
    for (let i = 0; i < ROWS; i++) {
        
        myGrid[i] = [];
        for (let j = 0; j < COLS; j++) {

            if (i == 0 || j == 0 || i == ROWS-1 || j == COLS -1 ) {
                myGrid[i][j] = itemOptions["wall"]["symbol"];
            } else {

                let next = 'e';
                
                outer:
                for (let type in itemOptions) {
                    if (chance(itemOptions[type]["buildChance"])) {
                        next = itemOptions[type]["symbol"];
                        break outer;
                    }
                }

                myGrid[i][j] = next;

            }
        }
    }

    return myGrid;
}


function gridToString(grid) {

    var responseString = "";

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            responseString += grid[i][j];
        }
        
        responseString += '\n';
    }
    return responseString.slice(0,responseString.length - 1);
}



export { gridToString, prepareGrid, World };