import { WelcomeView } from '../views/welcomeView.js'

class WelcomeController {

    constructor(eventDepot, router, callback) {
        this.eventDepot = eventDepot; 
        this.router = router;
        this.load = this.load.bind(this);
        this.view = new WelcomeView(this.eventDepot, this.router, () => { callback() });
    } 

    load() {
        this.view.load();
    }

    routeInitialRequest() {
        this.view.routeInitialRequest();
    }

}

export { WelcomeController };