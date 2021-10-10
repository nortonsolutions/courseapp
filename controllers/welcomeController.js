import { WelcomeView } from '../views/welcomeView.js'

class WelcomeController {

    constructor(eventDepot) {
        this.eventDepot = eventDepot; 

        this.load = this.load.bind(this);
        this.eventDepot.addListener("welcomeReady", this.load)

        this.view = new WelcomeView(this.eventDepot);
    } 

    load() {
        this.view.load();
    }

}

export { WelcomeController };