/**
 * quizActive scripts by Norton 2021
 * 
 * Provides supporting JavaScript for /quizActive page,
 * including QuizQuestion and Timer react components.
 *
 */

var userAnswers = localStorage.getItem("userAnswers")? JSON.parse(localStorage.getItem("userAnswers")) : []
var questionId = '';
var currentQuestionIndex = 0;
var quizId = document.getElementById('quizId').value;
var totalQuestions = Number(document.getElementById('totalQuestions').value);
var reviewMode = Boolean(document.getElementById('reviewMode').value == "true");
var timeLimit = Number(document.getElementById('timeLimit').value);

const hideQuestionInterface = () => {
    document.getElementById('quizControls').classList.add('d-none');
    document.getElementById('quizQuestion').classList.add('d-none');
}

const submitQuiz = () => {
    handlePost('/quiz/grade/' + quizId, {userAnswers: userAnswers}, (response) => {
        document.getElementById('feedback').innerHTML = JSON.parse(response).feedback;
        hideQuestionInterface();
    })
}

class QuizTimer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            timeRemaining: 60*props.timeLimit,
            running: true
        }
    }

    render() {
        return (
            <div id="timerContainer" className="col-2">
            {String(this.minutes(this.state.timeRemaining) + ":" + this.seconds(this.state.timeRemaining))}
            </div>
        )
    }

    minutes(totalTime) {
        return Math.floor(totalTime/60);
    }


    seconds(totalTime) {
        return (totalTime%60).toLocaleString("en-US", { minimumIntegerDigits: 2 })
    }

    tick() {

        if (this.state.timeRemaining <= 0) {
            this.setState({running: false});
        }

        this.setState({timeRemaining: this.state.timeRemaining - 1});
    }

    componentDidMount() {
        // document.getElementById('beep').load();
        setInterval(() => {
            if (this.state.running) {
                this.tick();
            }

        }, 1000)
    }
}
 
class QuizInterface extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <div>
            <div className="row">
                <div className="col-10">
                    <span className="text-primary" id="feedback"></span>
                </div>
                <QuizTimer timeLimit={timeLimit} />
            </div>
            <div id="quizControls" className="row">
                <div className="col-2">
                    <button id="previousQuestion" className="btn d-none">Back <span className="badge badge-primary"><i className="fas fa-minus"></i></span></button>
                </div>
                <div className="col-2">
                    <button id="nextQuestion" className="btn d-none">Next <span className="badge badge-primary"><i className="fas fa-plus"></i></span></button>
                </div>
                <div className="col-2">
                    <button id="finishQuiz" className="btn d-none">Done! <span className="badge badge-primary"><i className="fas fa-check"></i></span></button>
                </div>
            </div>
            <div id="quizQuestion"></div>
        </div>
        )
    }

    setButtonVisibility() {
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

    addButtonListeners() {
        let btnPreviousQuestion = document.getElementById('previousQuestion');
        let btnNextQuestion = document.getElementById('nextQuestion');
        let btnFinishQuiz = document.getElementById('finishQuiz');

        // Click events
        btnPreviousQuestion.addEventListener('click', (e) => {
            this.saveCurrentAnswer();
            currentQuestionIndex--;
            this.getQuestion();
        })

        btnNextQuestion.addEventListener('click', (e) => {
            this.saveCurrentAnswer(currentQuestionIndex);
            currentQuestionIndex++;
            this.getQuestion();
        })

        btnFinishQuiz.addEventListener('click', (e) => {
            this.saveCurrentAnswer();
            submitQuiz();
        })
    }

    applyCheckboxHandlers() {
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

    getQuestion() {
        let reviewString = reviewMode? '?mode=review' : '';
        handleGet('/quizActive/' + quizId + '/' + currentQuestionIndex + reviewString, (response) => {
            document.getElementById('quizQuestion').innerHTML = response;
            questionId = document.getElementById('questionId').value;
            this.setButtonVisibility();
            this.applyCheckboxHandlers();
            this.populateCurrentAnswer();
        });
    }

    populateCurrentAnswer() {
        if (userAnswers[currentQuestionIndex]) {
            userAnswers[currentQuestionIndex].answer.forEach((check, index) => {
                document.getElementById('checkbox' + index).checked = check;
            });
            document.getElementById('answerText').value = userAnswers[currentQuestionIndex].answerText;
            document.getElementById('answerEssay').value = userAnswers[currentQuestionIndex].answerEssay;
            let correctOrIncorrect = document.getElementById('correctOrIncorrect');
            if (userAnswers[currentQuestionIndex].correct && userAnswers[currentQuestionIndex].correct == true) {
                correctOrIncorrect.style.color = 'green';
                correctOrIncorrect.style.fontStyle = 'bold';
                correctOrIncorrect.innerText = 'Correct!';
            } else if (userAnswers[currentQuestionIndex].correct && userAnswers[currentQuestionIndex].correct == false) {
                correctOrIncorrect.style.color = 'red';
                correctOrIncorrect.style.fontStyle = 'bold';
                correctOrIncorrect.innerText = 'Incorrect';
            }
    
        }
    }
    
    saveCurrentAnswer() {
        
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
    
    }

    componentDidMount() {
        this.addButtonListeners();
        this.getQuestion();
    }
}

ReactDOM.render(
    <QuizInterface />,
    document.getElementById('quizInterface')
)
