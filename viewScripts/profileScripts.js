document.getElementById('userUpdateForm').addEventListener('submit', (e) => {
    handlePost('/updateAccount', {
        _id: e.target.elements.id.value,
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

        let userQuizId = e.target.elements.userQuizId.value;

        handlePost('/quiz', {
            userQuizId: userQuizId
        }, (response) => {
            let userQuiz = JSON.parse(response);
            localStorage.setItem('quizId', userQuiz.quizId);
            localStorage.setItem('userAnswers', JSON.stringify(userQuiz.answers));
            window.location.href='/quiz?mode=review&quizId=' + userQuiz.quizId;
        })

        e.preventDefault();

    })
})