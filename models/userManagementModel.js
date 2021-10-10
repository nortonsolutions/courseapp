// MODEL

let sampleDB = {
    0: {
        id: 0,
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
        id: 1,
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

class UserManagementModel {

    constructor() {
        this.userDB = localStorage['nortonQuizUserDB'] ? JSON.parse(localStorage['nortonQuizUserDB']) : sampleDB;
    }

    add(user) {
        let nextId = this.nextId()
        let userWithId = { id: nextId, ...user }
        this.userDB[nextId] = userWithId;
        this.save();
    }

    get(id) {
        return this.userDB[id];
    }

    getAll() {
        return this.userDB;
    }

    update(user) {
        this.userDB[user.id] = user;
        this.save();
    }

    remove(id) {
        delete this.userDB[id];
        this.save();
    }

    includes(id) {
        return Object.keys(this.userDB).includes(id);
    }

    nextId() {
        let number = 0;
        Object.keys(this.userDB).forEach(key => {
            if (key>number) number = key;
        });
        return Number(number)+1;
    }

    save() {
        localStorage['nortonQuizUserDB'] = JSON.stringify(this.userDB);
    }

}

export { UserManagementModel };