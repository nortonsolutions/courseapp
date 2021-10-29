class UserManagementView {

    constructor() {
        this.loadHandlebars();
    }

    load(request, callback) {
        this.location = document.getElementById('mainPlaceholder')
        this.location.innerHTML = this.text; // this.template(this.context);
        callback();
    }

    async loadHandlebars() {
        let hbs = await fetch("views/templates/userManagementView.hbs");
        this.text = await hbs.text();
    }

}

export { UserManagementView }