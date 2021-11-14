document.getElementById('newQuiz').addEventListener('submit', (e) => {
    let url = "/admin";
    let data = { quizName: e.target.elements.quizName.value }
    handlePost(url, data, (response) => {
        if (/error/.test(response)) {
            document.getElementById('feedback').innerHTML = response;
        } else {
            document.getElementById('feedback').innerHTML = response;
            document.getElementById('newQuiz').reset();
            handleGet('/admin/quizzes', (response) => {
                document.getElementById('selectQuiz').innerHTML = response;
            })
        }
    });

    e.preventDefault();
})

document.getElementById('selectQuiz').addEventListener('submit', (e) => {
    let quizId = e.target.elements.quizSelect.value;
    let url = "/quizAdmin/" + quizId;
    window.location.href = url;
    e.preventDefault();
})

document.getElementById('selectUser').addEventListener('submit', (e) => {
    let userId = e.target.elements.userName.value;
    // Get user details and re-render userUpdateForm with userUpdateForm.hbs
    handleGet('/admin/getUserUpdateForm?userId=' + userId, (response) => {
        document.getElementById('userUpdateForm').innerHTML = response;
        document.getElementById('userUpdateForm').classList.remove('d-none');
    })
    
    e.preventDefault();
})

document.getElementById('deleteUser').addEventListener('click', (e) => {
    if (confirm('Are you sure you want to delete this account?')) {
        let userId = document.getElementById('userName').value;
        handlePostTextResponse('/deleteAccount', {_id: userId}, (response) => {
            document.getElementById('selectUser').innerHTML = response;
        })
    }
    e.preventDefault();
})

document.getElementById('userUpdateForm').addEventListener('submit', (e) => {
    handlePost('/updateAccount', {
        _id: e.target.elements.id.value,
        username: e.target.elements.username.value,
        firstname: e.target.elements.firstname.value,
        surname: e.target.elements.surname.value,
        password: e.target.elements.password.value,
        confirm: e.target.elements.confirm.value,
        roles: e.target.elements.roles.value
    }, (response) => {
        document.getElementById('feedback').innerHTML = response;
    })
    e.preventDefault();
})