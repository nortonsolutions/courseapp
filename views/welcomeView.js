class WelcomeView {

    constructor(eventDepot, router, callback) {
        this.eventDepot = eventDepot;
        this.router = router;
        this.loadHandlebars(() => { callback (); });
    }

    load() {

        this.location = document.getElementById('mainPlaceholder');
        this.location.innerHTML = this.text;
        this.eventDepot.fire("renderComplete", this.location);
        document.title = "nortonQuiz Welcome";

    }

    async loadHandlebars(callback) {
        let hbs = await fetch("views/templates/welcomeView.hbs");
        this.text = await hbs.text();
        callback();
    }

    routeInitialRequest() {
        this.router.navigateTo(window.location.pathname, window.location.search, false);
    }

}

export { WelcomeView }