/**
 * NortonQuiz User Management - 2021
 */


import { UserManagementController } from './app/userManagementController.js'
import { MessagesController } from './app/messagesController.js'

class App {

    constructor() {
        this.controller = new UserManagementController();
        this.messagesController = new MessagesController();
    }

    load() {
        
        window.addEventListener('error', (e) => {
            this.messagesController.displayMessage(e.error);
        });

        // window.addEventListener('DOMContentLoaded', () => { });
    }
}

export { App }


