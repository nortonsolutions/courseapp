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
 *       timePassed: Number, (seconds)
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
var timeLimitText = document.getElementById('timeLimit').value;
var timeLimit = timeLimitText.length==0? Infinity : Number(timeLimitText)*60; //seconds
var timePassed = 0;

const msg = new SpeechSynthesisUtterance();

const markedOptions = {
    breaks: true
}

// Is a quiz already in progress for this user?
if (localStorage.getItem(userId + quizId)) {
    let quizObj = JSON.parse(localStorage.getItem(userId + quizId));
    userAnswers = quizObj.userAnswers;
    timePassed = quizObj.timePassed;
} 

const hideQuestionInterface = () => {
    document.getElementById('quizControls').classList.add('d-none');
    document.getElementById('quizQuestion').classList.add('d-none');
    document.getElementById('quizTimer').classList.add('d-none');
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

        // This is like a hybrid cross of save and submit, for projects
        if (! userAnswers[questionId]) {
            userAnswers[questionId] = {};
        }

        userAnswers[questionId].projectFile = e.target.elements[0].files[0].name;// filename;
        
        var formData = new FormData(e.target);
        formData.append('userAnswers', JSON.stringify(userAnswers));
        formData.append('timePassed', store? store.getState()["timePassed"] : 0);
        formData.append('projectFile', e.target.elements[0].files[0].name);


        handleFormPost('/quiz/projectSubmission/' + courseId + '/' + quizId, formData, (response) => {
            
            let returnToCoursePage = "<a href='/course/" + courseId + "'>Return to course page</a>"; 
            document.getElementById('feedback').innerHTML = JSON.parse(response).feedback + "..." + returnToCoursePage;
            localStorage.removeItem(userId + quizId);
            hideQuestionInterface();
        }) 

        e.preventDefault();
    })

}

const applyImageLink = () => {
    document.querySelector('.questionImage').addEventListener('click', (e) => {
        window.open('/public/uploads/' + e.target.id,'CourseApp image',"top=500,left=500,width=800,height=800"); 

    })
}

const getQuestion = (callback) => {
    handleGet('/quizActive/' + courseId + '/' + quizId + '/' + currentQuestionIndex, (response) => {
        document.getElementById('quizQuestion').innerHTML = response;
        questionId = document.getElementById('questionId').value;

        var questionMarked = marked(document.getElementById('questionRaw').innerText, markedOptions);
        document.getElementById('questionMarked').innerHTML = questionMarked;

        // Speech synthesis stuff
        msg.text = document.getElementById('questionMarked').innerText;
        let answers = document.getElementById('responseCheckboxes').querySelectorAll('textarea');
        if (answers) {
            msg.text += Array.from(answers)
                .filter(answer => answer.value.length > 0)
                .map((answer,index) => (index+1) + answer.value)
                .join();
        }
        
        setButtonVisibility();
        applyCheckboxHandlers();

        if (!reviewMode && document.getElementById('questionType').value == "projectSubmission") {
            addProjectSubmissionHandling(questionId);
        }

        applyImageLink();
        
        populateCurrentAnswer(questionId);
        Preview.callback();  // MathJax
        if (callback) callback();
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

    if (!reviewMode) {
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
        timePassed = store? store.getState()["timePassed"] : 0;

        localStorage.setItem(userId+quizId, JSON.stringify({
            userAnswers: userAnswers,
            timePassed: timePassed
        }));
        
    }
}

const submitQuiz = () => {
    handlePost('/quiz/grade/' + courseId + '/' + quizId, {
        userAnswers: userAnswers, 
        timePassed: timePassed
    }, (response) => {

        let returnToCoursePage = "<a href='/course/" + courseId + "'>Return to course page</a>"; 
        document.getElementById('feedback').innerHTML = JSON.parse(response).feedback + " ... " + returnToCoursePage;
        localStorage.removeItem(userId + quizId);
        hideQuestionInterface();
    })
}

/* Thanks to Wes Bos for this stuff */
const addSpeechSynthesis = () => {

    let voices = [];
    const voicesDropdown = document.querySelector('[name="voice"]');
    const options = document.querySelectorAll('[type="range"], [name="text"]');
    const speakButton = document.querySelector('#speak');

    function populatevoices() {
        voices = this.getVoices();
        // console.log(voices);

        voicesDropdown.innerHTML = voices
            .filter(voice => voice.name.match(/English/))
            .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
            .join('');
    }

    function setVoice() {
        msg.voice = voices.find(voice => voice.name == this.value);
        console.log(this.value);
    }

    function toggle(startOver = true) {
        speechSynthesis.cancel();

        if (startOver) {
            speechSynthesis.speak(msg);
        }
    }

    function setOption() {
        console.log(this.name, this.value);
        msg[this.name] = this.value;
        toggle();
    }

    speechSynthesis.addEventListener('voiceschanged', populatevoices);
    voicesDropdown.addEventListener('change', setVoice);
    options.forEach(option => option.addEventListener('change', setOption));
    speakButton.addEventListener('click', toggle);
    
}

addButtonListeners();
getQuestion();

addSpeechSynthesis();

// MathJax:
var Preview = {
    CreatePreview: function () {
        MathJax.Hub.Queue(
            ["Typeset",MathJax.Hub,document.getElementById("questionMarked")],
            ["Typeset",MathJax.Hub,document.getElementById("text0")],
            ["Typeset",MathJax.Hub,document.getElementById("text1")],
            ["Typeset",MathJax.Hub,document.getElementById("text2")],
            ["Typeset",MathJax.Hub,document.getElementById("text3")]
        );
    },
};
  
Preview.callback = MathJax.Callback(["CreatePreview",Preview]);
Preview.callback.autoReset = true;  // make sure it can run more than once
// End of MathJax
