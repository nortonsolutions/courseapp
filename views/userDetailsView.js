// VIEW

class UserDetailsView {

    constructor(controller) {
        this.controller = controller;
        this.loadHandlebars(() => {
            this.resetUserDetails();
        });
        
    }

    async loadHandlebars(callback) {
        let hbs = await fetch("views/templates/userDetailsView.hbs");
        let text = await hbs.text();
        this.template = Handlebars.compile(text);
        callback();
    }

    
    // VIEW
    resetUserDetails() {

        this.context = { id: this.controller.getNextUserId() }; 
        document.getElementById('userDetailsPlaceholder').innerHTML = this.template(this.context);
        this.addListeners();
    }
    

    // VIEW
    showUser(id) {
        
        this.context = this.controller.getUser(id);
        document.getElementById('userDetailsPlaceholder').innerHTML = this.template(this.context);
        this.showUserDetails();
        this.addListeners();
    
    }
    
    // VIEW
    showUserDetails () {

        document.getElementById("userDetailTable").classList.remove("d-none");
        document.getElementById("userDetailTable").classList.add("mb-3");
        document.getElementById("btnSaveUser").classList.remove("d-none");
        document.getElementById("btnCancel").classList.remove("d-none");
    
    }
    
    // VIEW
    hideUserDetails () {
    
        document.getElementById("userDetailTable").classList.add("d-none");
        document.getElementById("userDetailTable").classList.remove("mb-3");
        document.getElementById("btnSaveUser").classList.add("d-none");
        document.getElementById("btnCancel").classList.add("d-none");
    
    }

    addListeners() {
        document.getElementById("btnNewUser").addEventListener('click', e => {
            this.controller.new();
        });
    
        document.getElementById("btnCancel").addEventListener('click', e => {
            this.controller.cancel();
        });
    
        document.getElementById("userDetailForm").addEventListener('submit', e => {
            
            e.preventDefault();
            
            let newDate = new Date().toISOString();
    
            let formElements = document.getElementById("userDetailForm").elements;
            let id = formElements["id"].value;
            
            let userDetails = {
                id: id,
                name: formElements["name"].value,
                email: formElements["email"].value,
                gender: formElements["male"].checked ? 'm' : formElements["female"].checked ? 'f' : '',
                age: formElements["age"].value,
                role: formElements["role"].value,
                verified: formElements["verified"].checked,
                dateCreated: this.controller.checkCreationDate(id),
                dateUpdated: newDate
            }

            this.controller.save(userDetails);
            document.getElementById("dateUpdated").innerHTML = newDate;
            
        });

    }

}

export { UserDetailsView }