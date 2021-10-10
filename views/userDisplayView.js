// VIEW

class UserDisplayView {

    constructor(eventDepot, callback) {
        
        this.eventDepot = eventDepot;
        this.loadHandlebars(() => { callback() });
    }

    load(user) {

        this.context = user;
        this.location = document.getElementById('mainPlaceholder');
        this.location.innerHTML = this.template(this.context);
        this.eventDepot.fire("renderComplete", this.location);
        document.title = user.name;
    }

    async loadHandlebars(callback) {
        let hbs = await fetch("views/templates/userDisplayView.hbs");
        let text = await hbs.text();
        this.template = Handlebars.compile(text);
        if (callback) callback();
    }

}

export { UserDisplayView }