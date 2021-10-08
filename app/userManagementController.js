import { UserMasterView } from '../views/userMasterView.js'
import { UserDetailsView } from '../views/userDetailsView.js'
import { UserManagementModel } from './userManagementModel.js'

class UserManagementController {

    constructor() {
        this.db = new UserManagementModel()
        this.viewMaster = new UserMasterView(this);
        this.viewDetails = new UserDetailsView(this);
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

    load() {
        this.viewMaster.refresh();
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