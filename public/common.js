postOptions = (data) => {
    return {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json; charset=utf-8" }
    }
}

handlePost = (url, data, callback) => {
    fetch(url, postOptions(data))
    .then(response => response.json())
    .catch(error => {
        callback(JSON.stringify(error.message));
    })
    .then(response => { 
        callback(JSON.stringify(response));
    })
}