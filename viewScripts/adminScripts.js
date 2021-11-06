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
    let quizId = e.target.elements.quizName.value;
    let url = "/quizAdmin/" + quizId;
    window.location.href = url;
    e.preventDefault();
})

document.getElementById('selectUser').addEventListener('submit', (e) => {
    let userId = e.target.elements.userName.value;
    let url = "/quizAdmin/" + quizId;
    window.location.href = url;
    e.preventDefault();
})