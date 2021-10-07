/**
 * NortonQuiz User Management - 2021
 */

// MODEL
let userDB = {};
let sampleDB = {
    0: {
        name: "Dave Norton",
        email: "norton@whatever.com",
        gender: "m",
        age: 20,
        role: "Administrator",
        verified: true,
        dateCreated: "",
        dateUpdated: ""
    },
    1: {
        name: "Joe Smith",
        email: "joe@whatever.com",
        gender: "m",
        age: 22,
        role: "Student",
        verified: true,
        dateCreated: "",
        dateUpdated: ""
    }
}

// VIEW
document.addEventListener('DOMContentLoaded',() => {

    document.getElementById("btnNewUser").addEventListener('click', e => {
        resetUserDetails();
        showUserDetails();
    });

    document.getElementById("btnCancel").addEventListener('click', e => {
        hideUserDetails();
    });

    document.getElementById("userDetailForm").addEventListener('submit', e => {
        
        let id = e.target[0].value
        let newDate = new Date().toISOString();

        userDetails = {
            name: e.target[1].value,
            email: e.target[2].value,
            gender: e.target[3].checked ? 'm' : e.target[4].checked ? 'f' : '',
            age: e.target[5].value,
            role: e.target[6].value,
            verified: e.target[7].checked,
            dateCreated: checkCreationDate(id),
            dateUpdated: newDate
        }

        addNewUser(id, userDetails);

        document.getElementById("dateUpdated").innerHTML = newDate;
        e.preventDefault();
    });

    loadUserDB();
    populateUserList();

})

// CONTROL
function checkCreationDate(id) {
    if (Object.keys(userDB).includes(id)) {
        return userDB[id].dateCreated;
    } else return new Date().toISOString;
}


// CONTROL
function addNewUser(id, userDetails) {
    userDB[id] = userDetails;
    saveUserDB();
}

// VIEW
function resetUserDetails() {

    document.getElementById("userDetailForm").reset();
    document.querySelector("#id").value = getNextUserId();

}

// CONTROL
function getNextUserId() {
    let number = 0;
    Object.keys(userDB).forEach(key => {
        if (key>number) number = key;
    });
    return Number(number)+1;
}

// VIEW
function populateUserList() {
    
    let userMasterTable = document.querySelector("#userMasterTable tbody");
    let rows = userMasterTable.querySelectorAll("tr");
    rows.forEach(row => { row.remove(); })

    Object.keys(userDB).forEach(key => {
        
        let userRow = document.createElement('tr');
        
        let idElement = document.createElement('td');
        idElement.id = "listId";
        idElement.innerHTML = key;
        userRow.appendChild(idElement);

        let nameElement = document.createElement('td');
        nameElement.id = "listName";
        nameElement.innerHTML = userDB[key].name;
        userRow.appendChild(nameElement);

        let emailElement = document.createElement('td');
        emailElement.id = "listEmail";
        emailElement.innerHTML = userDB[key].email;
        userRow.appendChild(emailElement);

        let genderElement = document.createElement('td');
        genderElement.id = "listGender";
        let genderSymbol = '<i class="fa fa-question" aria-hidden="true"></i>'
        switch (userDB[key].gender) {
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

        deleteElement.addEventListener('click', e=> {
            
            if (confirm('Are you sure you want to delete ' + userDB[key].name + '?')) {
                delete userDB[key];
                saveUserDB();
                populateUserList();
            }

            e.stopPropagation;
        });
        userRow.appendChild(deleteElement);

        userRow.addEventListener('click', e => {
            showUser(key);
        });

        userMasterTable.appendChild(userRow);
    });
    
}


// VIEW
function showUser(id) {
    
    let currentUser = userDB[id];
    
    showUserDetails();

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

// CONTROLLER
function loadUserDB() {
    userDB = localStorage['nortonQuizUserDB'] ? JSON.parse(localStorage['nortonQuizUserDB']) : sampleDB;
}

// CONTROLLER
function saveUserDB() {
    localStorage['nortonQuizUserDB'] = JSON.stringify(userDB);
} 

// VIEW
function showUserDetails () {

    document.getElementById("userDetailTable").classList.remove("d-none");
    document.getElementById("userDetailTable").classList.add("mb-3");
    document.getElementById("btnSaveUser").classList.remove("d-none");
    document.getElementById("btnCancel").classList.remove("d-none");

}

// VIEW
function hideUserDetails () {

    document.getElementById("userDetailTable").classList.add("d-none");
    document.getElementById("userDetailTable").classList.remove("mb-3");
    document.getElementById("btnSaveUser").classList.add("d-none");
    document.getElementById("btnCancel").classList.add("d-none");

}