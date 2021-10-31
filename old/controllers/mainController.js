import { WelcomeController } from './welcomeController.js'
import { UserManagementController } from './userManagementController.js'

class MainController {

    constructor(eventDepot, router) { 

        this.eventDepot = eventDepot;
        this.router = router;

        this.userManagementController = new UserManagementController(this.eventDepot, () => {
            this.welcomeController = new WelcomeController(this.eventDepot, this.router, () => {
                this.loadInitialRequest();
            });
        });
        
    } 

    loadInitialRequest() {
        this.welcomeController.routeInitialRequest();
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