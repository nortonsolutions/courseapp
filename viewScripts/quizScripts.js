
var currentQuestionIndex = 0;
var quizId = '';
var userAnswers = [];

document.getElementById('selectQuiz').addEventListener('submit', (e) => {

    quizId = e.target.elements.quizName.value;
    if (confirm("Are you ready to start the quiz?")) {
        handleGet('/quiz/' + quizId + '/0', (response) => {
            document.getElementById('quizMain').innerHTML = response;
        })
    }
    e.preventDefault();
})

