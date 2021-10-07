// VIEW

class UserDetailsView {

    constructor(controller) {
        this.controller = controller;
        this.initializeView();
    }

    initializeView () {

        document.getElementById("btnNewUser").addEventListener('click', e => {
            this.controller.new();
        });
    
        document.getElementById("btnCancel").addEventListener('click', e => {
            this.controller.cancel();
        });
    
        document.getElementById("userDetailForm").addEventListener('submit', e => {
            
            e.preventDefault();
            let id = document.getElementById('id').value
            let newDate = new Date().toISOString();
    
            let userDetails = {
                name: e.target[1].value,
                email: e.target[2].value,
                gender: e.target[3].checked ? 'm' : e.target[4].checked ? 'f' : '',
                age: e.target[5].value,
                role: e.target[6].value,
                verified: e.target[7].checked,
                dateCreated: this.controller.checkCreationDate(id),
                dateUpdated: newDate
            }
    
            if (e.target[1].value.length == 0) {
                throw new Error('The name is empty!');
            } else {
                this.controller.save({id: id, ...userDetails});
                document.getElementById("dateUpdated").innerHTML = newDate;
            }
        });
    }
    
    // VIEW
    resetUserDetails() {
    
        document.getElementById("userDetailForm").reset();
        document.getElementById('dateCreated').innerHTML = null;
        document.getElementById('dateUpdated').innerHTML = null;
        document.querySelector("#id").value = this.controller.getNextUserId();
    }
    

    // VIEW
    showUser(id) {
        
        let currentUser = this.controller.getUser(id);
        
        if (currentUser) {
            this.showUserDetails();
    
            document.getElementById('id').value = id;
            document.getElementById('name').value = currentUser.name;
            document.getElementById('email').value = currentUser.email;
            if (currentUser.gender == 'm') {
                document.getElementById('male').checked = true;
            } else if (currentUser.gender == 'f') {
                document.getElementById('female').checked = true;
            }
            document.getElementById('age').value = currentUser.age;
            document.getElementById('role').value = currentUser.role;
            document.getElementById('verified').checked = currentUser.role;
            
            document.getElementById('dateCreated').innerHTML = currentUser.dateCreated;
            document.getElementById('dateUpdated').innerHTML = currentUser.dateUpdated;
        
        }
    
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

}

export { UserDetailsView }