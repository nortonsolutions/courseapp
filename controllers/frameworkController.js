import { FrameworkView } from '../views/frameworkView.js'

class FrameworkController {

    constructor(eventDepot, router, callback) { 
        this.eventDepot = eventDepot;
        this.router = router;
        this.frameworkView = new FrameworkView(this.eventDepot, this.router, () => {
            callback();
        });
        this.displayMessage = this.displayMessage.bind(this);
        
    } 

    displayMessage(message) {
        this.frameworkView.updateHeader({ message: message});
    }

    updateHeader(context) {
        this.frameworkView.updateHeader(context);
    }
}

export { FrameworkController }