class FrameworkView {

    constructor(eventDepot, router, callback) {
        this.eventDepot = eventDepot;
        this.router = router;
        
        this.preLoad("http://redrockcodecamp.org/educationMaterials/frameworks/js/handlebars/4.0.12/handlebars.min.js", () => {
            this.preLoad("http://redrockcodecamp.org/educationMaterials/frameworks/js/jquery/3.3.1/jquery.min.js", () => {
                this.preLoad("http://redrockcodecamp.org/educationMaterials/frameworks/js/bootstrap/4.1.3/js/bootstrap.bundle.js", () => {
                    this.preLoad("./app/handlebarHelpers.js", () => {

                        this.loadHeadView(() => {
                            document.head.innerHTML = this.head;
                        })

                        // Add main body elements with ids:

                        let header = document.createElement('header')
                        header.setAttribute('id', 'headerPlaceholder');
                        let main = document.createElement('main')
                        main.setAttribute('id', 'mainPlaceholder');
                        document.body.append(header);
                        document.body.append(main);

                        fetch("views/templates/navbarView.hbs").then(r => r.text()).then(navbar => {
                            Handlebars.registerPartial('navbar', navbar);

                            this.loadHeaderView(() => {

                                this.context = {
                                    mainActive: 'active',
                                    userManagementActive: '',
                                    message: ''
                                };

                                this.location = document.getElementById('headerPlaceholder');
                                this.template = Handlebars.compile(this.header);
                                this.updateHeader(this.context);

                                this.eventDepot.fire("renderComplete",this.location);

                                callback();

                            });
                        });

                        window.addEventListener('error', (e) => {
                            this.eventDepot.fire("displayMessage",e.error.stack);
                        });

                        window.addEventListener("popstate", e => {
                            let { path, query } = e.state;
                            this.router.navigateTo(path, query, true);
                        });
                    })
                })
            })
        });
    }

    // Update when context changes (navbar item clicked or message changes)
    updateHeader(context) {

        Object.keys(context).forEach(key => {
            this.context[key] = context[key];
        })

        document.getElementById('headerPlaceholder').innerHTML = this.template(this.context);

        // For new incoming messages, show the messageBox 
        if (context.message && context.message.length > 0) {
            document.getElementById('messageBox').classList.remove('d-none');
        }

        document.getElementById('btnDismissMessage').addEventListener('click', () => {
            this.hideMessage()
        })

        this.eventDepot.fire("renderComplete",this.location);

    }
    
    async loadHeadView(callback) {
        fetch("views/templates/headView.html")
            .then(hbs => hbs.text())
            .then(text => this.head = text)
            .then(() => callback());
    }

    async loadHeaderView(callback) {
        fetch("views/templates/headerView.hbs")
        .then(hbs => hbs.text())
        .then(text => this.header = text)
        .then(() => callback());
    }

    preLoad(scripting, callback) {
        var script = document.createElement("script");
        script.src = scripting;

        script.addEventListener("load", () => {
            callback();
        });

        document.body.appendChild(script);
    }


    hideMessage() {
        document.getElementById("messageBox").classList.add("d-none");
    }
}

export { FrameworkView }