/**
 * quizActive scripts by Norton 2021
 * 
 * Provides supporting JavaScript for /quizActive page,
 * including QuizQuestion and Timer react components.
 *
 */

/**
 * localStorage will contain entries that look like this:
 * 
 * { 
 *    userIdquizId: {
 *       userAnswers: [],
 *       timeRemaining: Number, (seconds)
 *    } 
 * }
 * 
 */

var questionId = '';
var currentQuestionIndex = 0;
var userId = document.getElementById('userId').value;
var quizId = document.getElementById('quizId').value;
var reviewMode = document.getElementById('reviewMode').value;
var totalQuestions = Number(document.getElementById('totalQuestions').value);
var userAnswers = [];
var timeLimit = Number(document.getElementById('timeLimit').value); // minutes

// Is a quiz already in progress for this user?
if (localStorage.getItem(userId + quizId)) {
    let quizObj = JSON.parse(localStorage.getItem(userId + quizId));
    userAnswers = quizObj.userAnswers;
    timeLimit = (quizObj.timeRemaining)/60
} 

const hideQuestionInterface = () => {
    document.getElementById('quizControls').classList.add('d-none');
    document.getElementById('quizQuestion').classList.add('d-none');
    document.getElementById('quizTimer').classList.add('d-none');
}

const submitQuiz = () => {
    handlePost('/quiz/grade/' + quizId, {userAnswers: userAnswers}, (response) => {
        document.getElementById('feedback').innerHTML = JSON.parse(response).feedback;
        localStorage.removeItem(userId + quizId);
        hideQuestionInterface();
    })
}

const setButtonVisibility = () => {
    let btnPreviousQuestion = document.getElementById('previousQuestion');
    let btnNextQuestion = document.getElementById('nextQuestion');
    let btnFinishQuiz = document.getElementById('finishQuiz');

    // Visibility
    if (currentQuestionIndex == 0) {
        btnPreviousQuestion.classList.add('d-none');
        btnFinishQuiz.classList.add('d-none');
        btnNextQuestion.classList.remove('d-none');
    } else if (currentQuestionIndex + 1 == totalQuestions){
        btnNextQuestion.classList.add('d-none');
        btnPreviousQuestion.classList.remove('d-none');
        if (!reviewMode) btnFinishQuiz.classList.remove('d-none');
    } else {
        btnFinishQuiz.classList.add('d-none');
        btnNextQuestion.classList.remove('d-none');
        btnPreviousQuestion.classList.remove('d-none');
    }

}

const addButtonListeners = () => {
    let btnPreviousQuestion = document.getElementById('previousQuestion');
    let btnNextQuestion = document.getElementById('nextQuestion');
    let btnFinishQuiz = document.getElementById('finishQuiz');

    // Click events
    btnPreviousQuestion.addEventListener('click', (e) => {
        saveCurrentAnswer();
        currentQuestionIndex--;
        getQuestion();
    })

    btnNextQuestion.addEventListener('click', (e) => {
        saveCurrentAnswer(currentQuestionIndex);
        currentQuestionIndex++;
        getQuestion();
    })

    btnFinishQuiz.addEventListener('click', (e) => {
        saveCurrentAnswer();
        submitQuiz();
    })
}

const applyCheckboxHandlers = () => {
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

const getQuestion = () => {
    handleGet('/quizActive/' + quizId + '/' + currentQuestionIndex, (response) => {
        document.getElementById('quizQuestion').innerHTML = response;
        questionId = document.getElementById('questionId').value;
        setButtonVisibility();
        applyCheckboxHandlers();
        populateCurrentAnswer();
    });
}

const populateCurrentAnswer = () => {
    if (userAnswers[currentQuestionIndex]) {
        userAnswers[currentQuestionIndex].answer.forEach((check, index) => {
            document.getElementById('checkbox' + index).checked = check;
        });
        document.getElementById('answerText').value = userAnswers[currentQuestionIndex].answerText;
        document.getElementById('answerEssay').value = userAnswers[currentQuestionIndex].answerEssay;
        
        if (reviewMode) {
            let correctOrIncorrect = document.getElementById('correctOrIncorrect');
            if (userAnswers[currentQuestionIndex].correct && userAnswers[currentQuestionIndex].correct == true) {
                correctOrIncorrect.style.color = 'green';
                correctOrIncorrect.style.fontStyle = 'bold';
                correctOrIncorrect.innerText = 'Correct!';
            } else {
                correctOrIncorrect.style.color = 'red';
                correctOrIncorrect.style.fontStyle = 'bold';
                correctOrIncorrect.innerText = 'Incorrect';
            }
        }
    }
}

const saveCurrentAnswer = () => {
    
    if (! userAnswers[currentQuestionIndex]) {
        userAnswers[currentQuestionIndex] = {};
    }

    userAnswers[currentQuestionIndex].questionId = questionId;
    userAnswers[currentQuestionIndex].answer = [
            document.getElementById('checkbox0').checked,
            document.getElementById('checkbox1').checked,
            document.getElementById('checkbox2').checked,
            document.getElementById('checkbox3').checked
       ];
    userAnswers[currentQuestionIndex].answerText = document.getElementById('answerText').value;
    userAnswers[currentQuestionIndex].answerEssay = document.getElementById('answerEssay').value;

    localStorage.setItem(userId+quizId, JSON.stringify({
        userAnswers: userAnswers,
        timeRemaining: store? store.getState()["timeRemaining"] : timeLimit
    }))
}



addButtonListeners();
getQuestion();
