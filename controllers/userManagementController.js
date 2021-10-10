import { UserManagementModel } from '../models/userManagementModel.js'
import { UserManagementView } from '../views/userManagementView.js'
import { UserMasterView } from '../views/userMasterView.js'
import { UserDetailsView } from '../views/userDetailsView.js'
import { UserDisplayView } from '../views/userDisplayView.js'

class UserManagementController {

    constructor(eventDepot) {
        
        this.eventDepot = eventDepot;
        this.db = new UserManagementModel();
        
        this.load = this.load.bind(this);

        this.view = new UserManagementView();
        this.viewDetails = new UserDetailsView(this, eventDepot);
        this.viewMaster = new UserMasterView(this, eventDepot);
    }

    // CONTROL
    checkCreationDate(id) {
        if (this.db.includes(id)) {
            return this.db.get(id).dateCreated;
        } else return new Date().toISOString();
    }

    exists(id) {
        return this.db.includes(id);
    }

    load(request) {
        this.view.load(request, () => {
            this.viewDetails.load(request);
            this.viewMaster.load(request);
            document.title = "nortonQuiz Manager"; 
        });
    }

    loadDisplay(request) {
        
        let userId = request.parameters[0].split("=")[1];
        let userObject = this.getUser(userId);
        this.viewDisplay = new UserDisplayView(this.eventDepot, () => {
            this.viewDisplay.load(userObject);
        });
    }

    getUser(id) {
        return this.db.get(id);
    }

    getAllUsers() {
        return this.db.getAll();
    }
    
    // CONTROL
    new() {
        this.viewDetails.resetUserDetails();
        this.viewDetails.showUserDetails();
    }

    save(user) {

        if (this.exists(user.id)) {
            this.db.update(user);
        } else {
            this.db.add(user);
            this.load();
            this.viewDetails.resetUserDetails();
            this.viewDetails.hideUserDetails();
    
        }
    }

    cancel() {
        this.viewDetails.hideUserDetails();
    }

    edit(id) {
        this.viewDetails.showUser(id);
    }

    delete(id) {
        this.db.remove(id);
        this.load();
        this.viewDetails.resetUserDetails();
        this.viewDetails.hideUserDetails();
    }

    // CONTROL
    getNextUserId() {
        return this.db.nextId();
    }
}

export { UserManagementController }