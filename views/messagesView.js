class MessagesView {

    constructor(controller) {
        this.controller = controller;
    }

    showMessage(message) {
        document.getElementById('messageBox').innerHTML = message;
    }

}

export { MessagesView }