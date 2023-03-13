class Component {
    
    constructor (template, sceneController) {
        
        this.width = template.width;
        this.height = template.height;
        this.x = template.x;
        this.y = template.y;
        this.color = template.color;
        this.name = template.name;
        this.type = template.type;
        this.image = template.image;

        this.sceneController = sceneController;
        this.sceneController.components.push(this);
    }

    update(callback, payload) { // payload includes additional stuff to add to basicData

        let basicData = {
            name: this.name,
            type: this.type,
            image: this.image,
            width: this.width,
            height: this.height,
            color: this.color,
            x: this.x,
            y: this.y
        }

        callback(Object.assign({...basicData, ...payload}));
    }

    toString() {
        return this.name;
    }

    midpoint() {
        return {
            x: (this.x + this.width) / 2 ,
            y: (this.y + this.height) / 2
        }
    }
}

export { Component };