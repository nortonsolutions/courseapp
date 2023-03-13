import { SceneController } from "./scene/sceneController.js";
import { EventDepot } from "./public/eventDepot.js"
import {messageBoxController} from "./errorMessageContoller.js";
import { Modal } from "./modal.js"

class App {
  constructor() {
    this.eventDepot = new EventDepot();
    this.sceneController = new SceneController(this.eventDepot);
    this.modal = new Modal(this.eventDepot);
    
    // add error handler?
  }

  addEventListeners() {
    //Global error message handler
    window.addEventListener("error", function(event) {
  
      var error = event.error;
      var message = error.message;
  
      if (error.stack) {
  
          message = message + "<hr><div class='text-left'>" + error.stack + "</div>";
      }
  
      messageBoxController.message(message, true);
       })



    this.eventDepot.addListener('showMessage', (data) => {
      document.getElementById('message').innerHTML = data.message;
      switch (data.type) {
        case "npc":
          this.sceneController.messageShowingNPC = true;
          break;
        case "enemy":
          this.sceneController.messageShowingEnemy = true;
          break;
        case "item":
          this.sceneController.messageShowingItem = true;
          break;

      }
      
    });

    this.eventDepot.addListener('hideMessage', () => {
      document.getElementById('message').innerHTML = '';
      this.sceneController.messageShowingEnemy = false;
      this.sceneController.messageShowingNPC = false;
      this.sceneController.messageShowingItem = false;
    });
  }

  run() {
    this.addEventListeners();
    this.sceneController.start();
  }
}

export { App };
