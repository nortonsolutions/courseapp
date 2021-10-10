import { WelcomeController } from './welcomeController.js'
import { UserManagementController } from './userManagementController.js'

class MainController {

    constructor(eventDepot) { 

        this.eventDepot = eventDepot;
        this.userManagementController = new UserManagementController(this.eventDepot);
        this.welcomeController = new WelcomeController(this.eventDepot);

    } 

    load(subController, request) {
        switch (subController) {
            case "welcome":
                this.welcomeController.load(request);
                break;
            case "userManagement":
                this.userManagementController.load(request);
                break;
            case "userDisplay":
                this.userManagementController.loadDisplay(request);
                break;
            default:
        }
    }

}

export { MainController };