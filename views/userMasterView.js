// VIEW

class UserMasterView {

    constructor(controller) {
        this.controller = controller;
        this.loadHandlebars(() => {

            this.allUsers = this.controller.getAllUsers();
            this.context = { 'users': this.allUsers }; 
            document.getElementById('userMasterPlaceholder').innerHTML = this.template(this.context);
            this.addListeners();
        });
        
    }

    async loadHandlebars(callback) {
        let hbs = await fetch("views/templates/userMasterView.hbs");
        let text = await hbs.text();
        this.template = Handlebars.compile(text);
        callback();
    }
    
    // VIEW
    addListeners() {
        
        let userMasterTable = document.querySelector("#userMasterTable tbody");
        let rows = userMasterTable.querySelectorAll("tr");
        
        rows.forEach(row => { 
            let currentId = row.firstElementChild.innerHTML;
            row.addEventListener('click', () => {
                this.controller.edit(currentId);
            });

            row.children[4].addEventListener('click', (e) => {
                e.stopPropagation;
                let currentId = e.currentTarget.parentNode.children[0].innerHTML;            
                let currentName = e.currentTarget.parentNode.children[1].innerHTML;            
                if (confirm('Are you sure you want to delete ' + currentName + '?')) {
                    this.controller.delete(currentId); 
                }
                e.stopPropagation();
            });
        });
    }

    refresh () {
        this.allUsers = this.controller.getAllUsers();
        document.getElementById('userMasterPlaceholder').innerHTML = this.template(this.context);
        this.addListeners();
    }
}

export { UserMasterView }