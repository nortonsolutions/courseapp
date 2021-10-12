// VIEW

class UserMasterView {

    constructor(controller, eventDepot) {
        
        this.controller = controller;
        this.eventDepot = eventDepot;
        
        this.loadHandlebars(() => {
            this.allUsers = this.controller.getAllUsers();
            this.context = { 'users': this.allUsers }; 
        });
    }

    load(request) {

        this.location = document.getElementById('userMasterPlaceholder');
        this.location.innerHTML = this.template(this.context);
        this.eventDepot.fire("renderComplete", this.location);
        this.addListeners();
    }

    async loadHandlebars(callback) {
        let hbs = await fetch("views/templates/userMasterView.hbs");
        let text = await hbs.text();
        this.template = Handlebars.compile(text);
        if (callback) callback();
    }
    
    // VIEW
    addListeners() {
        
        let userMasterTable = this.location.querySelector("#userMasterTable tbody");
        let rows = userMasterTable.querySelectorAll("tr");
        
        rows.forEach(row => { 
            let currentId = row.firstElementChild.innerHTML;
            // row.addEventListener('click', () => {
            //     this.controller.edit(currentId);
            // });

            // EDIT USER
            row.children[6].addEventListener('click', (e) => {

                let currentId = e.currentTarget.parentNode.children[0].innerHTML;            
                let currentName = e.currentTarget.parentNode.children[1].innerHTML;            
                if (confirm('Are you sure you want to delete ' + currentName + '?')) {
                    this.controller.delete(currentId); 
                }
                e.stopPropagation();
            });
        });
    }
}

export { UserMasterView }