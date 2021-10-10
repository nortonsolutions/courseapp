/**
 * NortonQuiz User Management - 2021
 */

import { NavbarController } from './controllers/navbarController.js'
import { MainController } from './controllers/mainController.js'
import { Router } from './app/router.js'
import { EventDepot } from './app/eventDepot.js'

class MainApp {

    constructor() {

        this.router = new Router();
        this.addRouters();

        this.eventDepot = new EventDepot();
        this.eventDepot.addListener("renderComplete", this.router.setRouteLinks);

        this.navbarController = new NavbarController(this.eventDepot);
        this.mainController = new MainController(this.eventDepot);

        this.eventDepot.addListener("displayMessage", this.navbarController.displayMessage)

    }

    addRouters() {
        this.router.add("/", (request) => { this.mainController.load("welcome", request); });
        this.router.add("/main.html", (request) => { this.mainController.load("welcome", request); });
        this.router.add("/userManagement.html", (request) => { this.mainController.load("userManagement", request); });
        this.router.add("/user.html", (request) => { this.mainController.load("userDisplay", request); });
    }
}

export { MainApp }