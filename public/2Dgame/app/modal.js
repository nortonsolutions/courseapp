import { InventoryScreen } from "./inventoryScreen.js";

class Modal {
  constructor(eventDepot) {
    this.eventDepot = eventDepot;
    this.inventoryScreen = new InventoryScreen(eventDepot, this);

    this.closeModal = this.closeModal.bind(this);

    /** e.g. data: { type: 'loadGame', title: 'Load Game', context: response } */
    eventDepot.addListener("modal", data => {

        this.loadTemplate("modal-body", data.type, data.context, () => {
        switch (data.type) {
          case "inventory":
            this.inventoryScreen.addInventoryListeners();
            break;
        }
      });

      var modal = document.getElementById("myModal");
      var closer = document.getElementsByClassName("close")[0];
      var modalTitle = (document.getElementById("modal-title").innerHTML = data.title);

      modal.style.display = "block";

      closer.onclick = () => {
        this.closeModal();
      };
    });

    eventDepot.addListener("closeModal", () => {
      this.closeModal();
    });

    eventDepot.addListener("disableCloser", () => {
      document.getElementsByClassName("close")[0].classList.add("d-none");
    });

    eventDepot.addListener("enableCloser", () => {
      document.getElementsByClassName("close")[0].classList.remove("d-none");
    });
  }

  closeModal = () => {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
  };

  loadTemplate = (elementId, template, data, callback) => {
    handleGet(`/views/${template}.hbs`, response => {
      let template = Handlebars.compile(response);
      document.getElementById(elementId).innerHTML = template(data);
      if (callback) callback();
    });
  };
}

export { Modal };
