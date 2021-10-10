import { NavbarView } from '../views/navbarView.js'

class NavbarController {

    constructor(eventDepot) { 
        this.eventDepot = eventDepot;
        this.navbarView = new NavbarView(this.eventDepot);

        this.displayMessage = this.displayMessage.bind(this);
    } 

    displayMessage(message) {
        this.navbarView.showMessage(message);
    }

}

export { NavbarController };