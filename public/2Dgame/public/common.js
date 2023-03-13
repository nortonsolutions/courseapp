function degreesToRadians(degrees) {
    return Number(degrees) * Math.PI / 180;
}

function getRnd(min,max) {
    // return Math.random() * ((max - min) + min);
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function shiftTowardCenter(value, factor) {
    if (value != 0) {
        if (value > 0) {
            return value - (5 * factor);
        } else return value + (5 * factor);
    } else return value;
}

getOptions = () => {
    return {
        method: 'GET'
    }
}

handleGet = (url, callback) => {
    fetch(url, getOptions())
    .then(response => response.text())
    .catch(error => {
        callback(error.message);
    })
    .then(response => { 
        callback(response);
    })
}
