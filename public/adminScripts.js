// Eventually this script will be added to the admin.hbs after testing


document.getElementById('newQuiz').addEventListener('submit', (e) => {
    let url = "/admin";
    let data = { quizName: e.target.elements.quizName.value }
    handlePost(url, data, (response) => {
        if (/error/.test(response)) {
            document.getElementById('feedback').innerHTML = response;
        } else {
            window.location.href = '/admin?feedback=Success';
        }
    });

    e.preventDefault();
})

document.getElementById('selectQuiz').addEventListener('submit', (e) => {
    let quizId = e.target.elements.sel1.value;
    let url = "/quizAdmin/" + quizId;
    fetch(url);
    e.preventDefault();
})