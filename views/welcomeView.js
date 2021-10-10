class WelcomeView {

    constructor(eventDepot) {
        this.eventDepot = eventDepot;
        this.loadHandlebars();
    }

    load() {

        this.location = document.getElementById('mainPlaceholder');
        this.location.innerHTML = this.text;
        this.eventDepot.fire("renderComplete", this.location);
        document.title = "nortonQuiz Welcome";

    }

    async loadHandlebars() {
        let hbs = await fetch("views/templates/welcomeView.hbs");
        this.text = await hbs.text();
        this.eventDepot.fire("welcomeReady");
    }

}

export { WelcomeView }