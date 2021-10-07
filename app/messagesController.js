import { MessagesView } from '../views/messagesView.js'

class MessagesController {

    constructor() { 
        this.messagesView = new MessagesView(this);
    } 

    displayMessage(message) {

        // let context = { 'hidden': false, 'message': message };
        // fetch("app/views/templates/messages.hbs").then(response => response.text()).then(text => {
        //     let template = Handlebars.compile(text);
        this.messagesView.showMessage(message);
       
        
        // });
        
    }

}

export { MessagesController };