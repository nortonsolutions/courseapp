var questionId = '';
var currentQuestionIndex = 0;
var quizId = localStorage.getItem("quizId")? localStorage.getItem("quizId") : '';
var userAnswers = localStorage.getItem("userAnswers")? JSON.parse(localStorage.getItem("userAnswers")) : []
let reviewMode = false;

getCurrentQuestion = (reviewMode) => {
    
    let reviewQuery = reviewMode? '?mode=review' : ''
    handleGet('/quiz/' + quizId + '/' + currentQuestionIndex + reviewQuery, (response) => {
        document.getElementById('quizMain').innerHTML = response;
        questionId = document.getElementById('questionId').value;
        addQuizActiveButtonListeners();
        applyCheckboxHandlers();
        populateCurrentAnswer();
    })
}

populateCurrentAnswer = () => {
    if (userAnswers[currentQuestionIndex]) {
        userAnswers[currentQuestionIndex].answer.forEach((check, index) => {
            document.getElementById('checkbox' + index).checked = check;
        });
        document.getElementById('answerText').value = userAnswers[currentQuestionIndex].answerText;
        document.getElementById('answerEssay').value = userAnswers[currentQuestionIndex].answerEssay;
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
       ],
       answerText: document.getElementById('answerText').value,
       answerEssay: document.getElementById('answerEssay').value
    }
}

hideInterface = () => {
    document.getElementById('quizMain').classList.add('d-none');
}

submitQuiz = () => {
    handlePost('/quiz/grade/' + quizId, {userAnswers: userAnswers}, (response) => {
        document.getElementById('feedback').innerHTML = JSON.parse(response).feedback;
        hideInterface();
    })
}

applyCheckboxHandlers = () => {
        let checkboxArray = Array.from(document.querySelectorAll(".checkbox"));
        checkboxArray.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                let currentItem = e.target;
                if (document.getElementById('questionType').value == 'single' && currentItem.checked) {
                    // Unselect the others
                    checkboxArray.forEach(item => {
                        if (item.name != currentItem.name) item.checked = false;
                    })
                }
            })
        })
}


addQuizActiveButtonListeners = () => {
    document.getElementById('previousQuestion').addEventListener('click', (e) => {
        saveCurrentAnswer();
        currentQuestionIndex--;
        getCurrentQuestion(reviewMode);
    })

    document.getElementById('nextQuestion').addEventListener('click', (e) => {
        saveCurrentAnswer();
        currentQuestionIndex++;
        getCurrentQuestion(reviewMode);
    })

    document.getElementById('finishQuiz').addEventListener('click', (e) => {
        saveCurrentAnswer();
        submitQuiz();
    })
}

if (document.getElementById('selectQuiz')) {
    document.getElementById('selectQuiz').addEventListener('submit', (e) => {
    
        localStorage.removeItem('userAnswers');
        userAnswers = [];
        quizId = e.target.elements.quizName.value;
        if (confirm("Are you ready to start the quiz?")) {
            getCurrentQuestion(reviewMode);
        }
        e.preventDefault();
    
    })
} else {
    reviewMode = true;
    getCurrentQuestion(reviewMode);
}