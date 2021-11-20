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
 *       userAnswers: {},
 *       timeRemaining: Number, (seconds)
 *    } 
 * }
 * 
 */

var currentQuestionIndex = 0;
var questionId = '';
var userId = document.getElementById('userId').value;
var quizId = document.getElementById('quizId').value;
var courseId = document.getElementById('courseId').value;
var reviewMode = document.getElementById('reviewMode').value;
var totalQuestions = Number(document.getElementById('totalQuestions').value);
var userAnswers = {};
var timeLimit = Number(document.getElementById('timeLimit').value); // minutes

const markedOptions = {
    breaks: true
}

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
    handlePost('/quiz/grade/' + courseId + '/' + quizId, {userAnswers: userAnswers}, (response) => {
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

    if (document.getElementById('questionType').value == "projectSubmission") {
        btnFinishQuiz.classList.add('d-none');
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
        saveCurrentAnswer();
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

const addProjectSubmissionHandling = () => {
    Array.from(document.querySelectorAll('.custom-file-input')).forEach(el => {
        el.addEventListener('change', e => {
            let filename = String(e.target.files[0].name);
            let ending = Array.from(filename).splice(-3,3).join('');
            let firstpart = filename.substring(0,filename.indexOf('.')).slice(0,8);
            e.target.labels[0].innerText = firstpart + "..." + ending;
        })
    })

    document.getElementById('projectSubmissionForm').addEventListener('submit', e => {

        if (! userAnswers[questionId]) {
            userAnswers[questionId] = {};
        }

        userAnswers[questionId].projectFile = e.target.elements[0].files[0].name;// filename;
        
        var formData = new FormData(e.target);
        formData.append('userAnswers', JSON.stringify(userAnswers));
        formData.append('projectFile', e.target.elements[0].files[0].name);

        handleFormPost('/quiz/projectSubmission/' + courseId + '/' + quizId, formData, (response) => {
            document.getElementById('feedback').innerHTML = JSON.parse(response).feedback;
            localStorage.removeItem(userId + quizId);
            hideQuestionInterface();
        }) 

        e.preventDefault();
    })

}

const getQuestion = () => {
    handleGet('/quizActive/' + courseId + '/' + quizId + '/' + currentQuestionIndex, (response) => {
        document.getElementById('quizQuestion').innerHTML = response;
        questionId = document.getElementById('questionId').value;

        var questionMarked = marked(document.getElementById('questionRaw').innerText, markedOptions);
        document.getElementById('questionMarked').innerHTML = questionMarked;
        
        setButtonVisibility();
        applyCheckboxHandlers();

        if (document.getElementById('questionType').value == "projectSubmission") {
            addProjectSubmissionHandling(questionId);
        }

        populateCurrentAnswer(questionId);
    });
}

const populateCurrentAnswer = () => {

    let questionType = document.getElementById('questionType').value;
    if (userAnswers[questionId]) {

        if (userAnswers[questionId].answer) {
            userAnswers[questionId].answer.forEach((check, index) => {
                document.getElementById('checkbox' + index).checked = check;
            });
            document.getElementById('answerText').value = userAnswers[questionId].answerText;
            document.getElementById('answerEssay').value = userAnswers[questionId].answerEssay;
        }
        
        if (userAnswers[questionId].projectFile) {
            document.getElementById('userProjectLink').innerHTML="Existing project: <a href='/public/projects/" + userAnswers[questionId].projectFile + "'>" + userAnswers[questionId].projectFile + "</a>"
        }

        if (reviewMode && questionType != "instructional" && questionType != "projectSubmission") {
            let correctOrIncorrect = document.getElementById('correctOrIncorrect');
            if (userAnswers[questionId].correct && userAnswers[questionId].correct == true) {
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
    
    if (! userAnswers[questionId]) {
        userAnswers[questionId] = {};
    }

    userAnswers[questionId].answer = [
            document.getElementById('checkbox0').checked,
            document.getElementById('checkbox1').checked,
            document.getElementById('checkbox2').checked,
            document.getElementById('checkbox3').checked
       ];
    userAnswers[questionId].answerText = document.getElementById('answerText').value;
    userAnswers[questionId].answerEssay = document.getElementById('answerEssay').value;

    localStorage.setItem(userId+quizId, JSON.stringify({
        userAnswers: userAnswers,
        timeRemaining: store? store.getState()["timeRemaining"] : timeLimit
    }))
}



addButtonListeners();
getQuestion();
