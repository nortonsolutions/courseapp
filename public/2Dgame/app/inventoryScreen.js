class InventoryScreen {
  constructor(eventDepot, modal) {
    this.eventDepot = eventDepot;
    this.modal = modal;
  }

  addInventoryListeners() {
    // get the buttons
    document.querySelectorAll("button").forEach(button => {
      button.addEventListener("click", e => {
        console.dir(e);

        // Which button was clicked?
        var eventType = e.target.textContent; // e.g. "Drop" "Use" "Equip"

        // What is the name of the item?
        var itemName =
          e.target.parentNode.parentNode.firstElementChild.innerText;

        switch (eventType) {
          case "Drop":
            this.eventDepot.fire("dropItemToScene", itemName);
            break;

          case "Use":
            //TODO: Use item properties
            break;

          case "Equip":
            //TODO: add to hero
            break;
        }
      });
    });
  }
}

export { InventoryScreen };
