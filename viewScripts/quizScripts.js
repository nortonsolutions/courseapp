
var quizId = '';
var questionId = '';
var currentQuestionIndex = 0;
var userAnswers = [];
var reviewMode = false;

document.getElementById('selectQuiz').addEventListener('submit', (e) => {
    
    reviewMode = false;
    quizId = e.target.elements.quizName.value;
    if (confirm("Are you ready to start the quiz?")) {
        getCurrentQuestion();
    }
    e.preventDefault();

})

document.getElementById('reviewQuiz').addEventListener('click', (e) => {
    reviewMode = true;
    document.getElementById('quizMain').classList.remove('d-none');
    document.getElementById('reviewQuiz').classList.add('d-none');
    currentQuestionIndex = 0;
    getCurrentQuestion();
    e.preventDefault();
})

getCurrentQuestion = () => {
    
    let reviewQuery = '';

    if (reviewMode) {
        reviewQuery = '?showAnswers=true';
    }

    handleGet('/quiz/' + quizId + '/' + currentQuestionIndex + reviewQuery, (response) => {
        document.getElementById('quizMain').innerHTML = response;
        questionId = document.getElementById('questionId').value;
        addQuizActiveButtonListeners();
        populateCurrentAnswer();
    })
}

populateCurrentAnswer = () => {
    if (userAnswers[currentQuestionIndex]) {
        userAnswers[currentQuestionIndex].answer.forEach((check, index) => {
            document.getElementById('checkbox' + index).checked = check;
        })
    }
}

saveCurrentAnswer = () => {
    userAnswers[currentQuestionIndex] = {
        questionId: questionId,
        answer:     [
            document.getElementById('checkbox0').checked,
            document.getElementById('checkbox1').checked,
            document.getElementById('checkbox2').checked,
            document.getElementById('checkbox3').checked
       ]
    }
}

hideInterface = () => {
    document.getElementById('quizMain').classList.add('d-none');
}

submitQuiz = () => {
    handlePost('/quiz/grade/' + quizId, {userAnswers: userAnswers}, (response) => {
        document.getElementById('feedback').innerHTML = JSON.parse(response).feedback;
        document.getElementById('reviewQuiz').classList.remove('d-none');
        hideInterface();
    })
}

addQuizActiveButtonListeners = () => {
    document.getElementById('previousQuestion').addEventListener('click', (e) => {
        saveCurrentAnswer();
        currentQuestionIndex--;
        getCurrentQuestion();
    })

    document.getElementById('nextQuestion').addEventListener('click', (e) => {
        saveCurrentAnswer();
        currentQuestionIndex++;
        getCurrentQuestion();
    })

    document.getElementById('finishQuiz').addEventListener('click', (e) => {
        saveCurrentAnswer();
        submitQuiz();
    })
}
