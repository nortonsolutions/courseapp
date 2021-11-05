document.getElementById('userUpdateForm').addEventListener('submit', (e) => {
    handlePost('/updateAccount', {
        username: e.target.elements.username.value,
        firstname: e.target.elements.firstname.value,
        surname: e.target.elements.surname.value,
        password: e.target.elements.password.value,
        confirm: e.target.elements.confirm.value
    }, (response) => {
        document.getElementById('feedback').innerHTML = response;
    })
    e.preventDefault();
})


Array.from(document.querySelectorAll('.userQuiz')).forEach(userQuiz => {
    userQuiz.addEventListener('click', (e) => {

        let quizId = document.getElementById('quizId').value;
        let userQuizId = document.getElementById('userQuizId').value;

        handlePostTextResponse('/quiz', {
            quizId: quizId,
            userQuizId: userQuizId
        }, (response) => {
            document.getElementById('profileMain').innerHTML = response;
        })

    })
})