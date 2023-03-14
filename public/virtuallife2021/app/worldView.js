
class WorldView {

    constructor(stringGrid,interval) {
        
        this.paused = false;
        this.buildStatTable(interval);
        this.tableElement = document.createElement("table");
        this.tableElement.id = "worldTable"
        document.body.appendChild(this.tableElement);

        stringGrid.forEach((row, rowNumber) => {
            let tr = this.tableElement.appendChild(document.createElement("tr"))
            row.forEach((item, colNumber) => {
                let td = tr.appendChild(document.createElement("td"));
                td.id = "r" + rowNumber + "d" + colNumber;
                let hovertext = document.createElement("span");
                hovertext.className = "hovertext";
                td.appendChild(hovertext);
                td.class = item.symbol;
            });
        });

    }

    render(stringGrid, stats) {
        
        let beforeRender = new Date();

        this.generationEl.innerHTML = stats.generation + " generations";
        this.intervalEl.innerHTML = stats.interval + " ms interval";
        this.turnTimeEl.innerHTML = stats.turnTime + " ms per turn";

        stringGrid.forEach((row, rowNumber) => {
            row.forEach((item, colNumber) => {
                
                if (item.change) {
                    let td = document.getElementById("r" + rowNumber + "d" + colNumber);
                
                    if (item.symbol != "e" && item.symbol != "w") td.children[0].innerText = Math.floor(item.health);
    
                    var healthCode;
                    if (item.symbol == "a" || item.symbol == "c" || item.symbol == "p" || item.symbol == "o") {
                        if (item.health < 40) {
                            healthCode = "dying";
                        } else if (item.health < 60) {
                            healthCode = "hurt";
                        } else {
                            healthCode = "normal";
                        }
                    }
    
                    td.className = item.symbol + " " + healthCode;
    
                }

            });
        });

        this.renderTime = new Date() - beforeRender;
        this.renderTimeEl.innerHTML = this.renderTime + " ms per rendering";
    }

    buildStatTable() {

        let statTable = document.createElement("div");
        statTable.id = "statTable"
        document.body.appendChild(statTable);


        let pauseButton = document.createElement("button");
        this.intervalEl = document.createElement("div");
        this.generationEl = document.createElement("div");
        this.turnTimeEl = document.createElement("div");
        this.renderTimeEl = document.createElement("div");
        this.totalWorldItemsEl = document.createElement("div");

        pauseButton.innerHTML = " ' ' ";
        statTable.append(pauseButton);
        statTable.append(this.intervalEl);
        statTable.append(this.generationEl);
        statTable.append(this.turnTimeEl);
        statTable.append(this.renderTimeEl);
        statTable.append(this.totalWorldItemsEl);
        
        pauseButton.addEventListener("click",(e) => {
            this.paused = ! this.paused;
        });

    }

}



export { WorldView };