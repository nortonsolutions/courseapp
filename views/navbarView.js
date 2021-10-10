class NavbarView {

    constructor(eventDepot) {
        this.eventDepot = eventDepot;
        this.loadHandlebars(() => {
            this.context = { };
            
            this.location = document.getElementById('navbarPlaceholder');
            this.location.innerHTML = this.template(this.context);

            window.addEventListener('error', (e) => {
                this.eventDepot.fire("displayMessage",e.error);
            });

            this.eventDepot.fire("renderComplete", this.location);

           // window.addEventListener('DOMContentLoaded', () => { });
        });
    }

    async loadHandlebars(callback) {
        let hbs = await fetch("views/templates/navbarView.hbs");
        let text = await hbs.text();
        this.template = Handlebars.compile(text);
        callback();
    }

    showMessage(message) {
        this.context = { 'message': message }; 
        this.location.innerHTML = this.template(this.context);
    }

}

export { NavbarView }