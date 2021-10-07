// VIEW

class UserMasterView {

    constructor(controller) {
        this.controller = controller;
        this.initializeView();
    }

    initializeView () {
        this.populateUserList();
    }
    
    // VIEW
    populateUserList() {
        
        let userMasterTable = document.querySelector("#userMasterTable tbody");
        let rows = userMasterTable.querySelectorAll("tr");
        rows.forEach(row => { row.remove(); })
    
        let allUsers = this.controller.getAllUsers();

        Object.keys(allUsers).forEach(key => {
            
            let currentUser = this.controller.getUser(key);

            let userRow = document.createElement('tr');
            
            let idElement = document.createElement('td');
            idElement.id = "listId";
            idElement.innerHTML = key;
            userRow.appendChild(idElement);
    
            let nameElement = document.createElement('td');
            nameElement.id = "listName";
            nameElement.innerHTML = currentUser.name;
            userRow.appendChild(nameElement);
    
            let emailElement = document.createElement('td');
            emailElement.id = "listEmail";
            emailElement.innerHTML = currentUser.email;
            userRow.appendChild(emailElement);
    
            let genderElement = document.createElement('td');
            genderElement.id = "listGender";
            let genderSymbol = '<i class="fa fa-question" aria-hidden="true"></i>'
            switch (currentUser.gender) {
                case 'm':
                    genderSymbol = '<i class="fa fa-male" aria-hidden="true"></i>'
                    break;
    
                case 'f':
                    genderSymbol = '<i class="fa fa-female" aria-hidden="true"></i>'
                    break; 
            }
            genderElement.innerHTML = genderSymbol;
            userRow.appendChild(genderElement);
    
            let deleteElement = document.createElement('td');
            deleteElement.id = "delete";
            deleteElement.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';
    
            deleteElement.addEventListener('click', (e) => {
                e.stopPropagation;            
                if (confirm('Are you sure you want to delete ' + currentUser.name + '?')) {
                    this.controller.delete(key); 
                }
    
            });
            userRow.appendChild(deleteElement);
    
            userRow.addEventListener('click', e => {
                this.controller.edit(key);
            });
    
            userMasterTable.appendChild(userRow);
        });
        
    }
    

}

export { UserMasterView }