/**
 * NortonQuiz User Management - 2021
 */

import { FrameworkController } from './controllers/frameworkController.js' 
import { MainController } from './controllers/mainController.js'
import { Router } from './app/router.js'
import { EventDepot } from './app/eventDepot.js'

class MainApp {

    constructor() {

        this.router = new Router();
        this.addRouters();

        this.eventDepot = new EventDepot();
        this.eventDepot.addListener("renderComplete", this.router.setRouteLinks);

        this.frameworkController = new FrameworkController(this.eventDepot, this.router, () => {
            this.mainController = new MainController(this.eventDepot, this.router);
        })

        // this.eventDepot.addListener("displayMessage", this.frameworkController.displayMessage)

    }

    addRouters() {

        this.router.add("/", (request) => { 
            this.mainController.load("welcome", request); 
            this.frameworkController.updateHeader({ 
                mainActive: 'active',
                userManagementActive: '',
            })
        });

        this.router.add("/main.html", (request) => { 
            this.mainController.load("welcome", request); 
            this.frameworkController.updateHeader({ 
                mainActive: 'active',
                userManagementActive: '',
            })
        });

        this.router.add("/userManagement.html", (request) => { 
            this.mainController.load("userManagement", request); 
            this.frameworkController.updateHeader({ 
                mainActive: '',
                userManagementActive: 'active',
            })
        });

        this.router.add("/user.html", (request) => { 
            this.mainController.load("userDisplay", request); 
            this.frameworkController.updateHeader({ 
                mainActive: '',
                userManagementActive: 'active',
            })

        });
    }
}

export { MainApp }