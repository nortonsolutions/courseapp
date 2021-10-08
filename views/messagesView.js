class MessagesView {

    constructor(controller) {
        this.controller = controller;
        this.loadHandlebars();
    }

    async loadHandlebars() {
        let hbs = await fetch("views/templates/messagesView.hbs");
        let text = await hbs.text();
        this.template = Handlebars.compile(text);
    }

    showMessage(message) {
        this.context = { 'message': message }; 
        document.getElementById('messagesPlaceholder').innerHTML = this.template(this.context);
    }

}

export { MessagesView }