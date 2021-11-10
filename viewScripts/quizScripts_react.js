/**
 * React quizScripts by Norton 2021
 * 
 * The idea here is to add some React-based functionality
 * to the quizApp main quiz interface, starting with a timer.
 * 
 * It will also be in charge of managing the user quiz state,
 * so that a user could return after a break to resume.  The idea
 * is that when a user returns to the quiz tab, it will restore
 * to the last state, including quiz progress, timer status, etc.
 * 
 * This script is written with JSX, so is interpretted by Babel.
 * 
 */

const SETQUIZZES = 'SETQUIZZES';
const SETQUIZID = 'SETQUIZID';

const setQuizIdAction = (payload) => ({
    type: SETQUIZID,
    payload
})

const setQuizzesAction = (payload) => ({
    type: SETQUIZZES,
    payload
})
 
const initialState = {
    quizzes: []
}

const reducer = (state = initialState, { type, payload }) => {
    switch (type) {
 
        case SETQUIZZES:
            return { ...state, ...payload };

        case SETQUIZID:
            return { ...state, ...payload };
    
        default:
            return state
    }
}

const store = Redux.createStore(reducer, Redux.applyMiddleware(ReduxThunk.default));
// const store = Redux.createStore(reducer);

const mapStateToProps = (state) => {
    return {
        quizzes: state.quizzes,
        questionId: state.questionId,
        currentQuestionIndex: state.currentQuestionIndex,
        quizId: state.quizId,
        userAnswers: state.userAnwers,
        reviewMode: state.reviewMode,
        timeRemaining: state.timeRemaining
    }
}
    

const mapDispatchToProps = (dispatch) => {
    return {
        setQuizzes: (payload) => {
            dispatch(setQuizzesAction(payload));
        }
    }
};

class SelectQuiz extends React.Component {
    constructor(props) {
        super(props);
        this.actionString = '/quizReact?quizId=';
    }

    render() {

        var options = this.props.quizzes.map(quiz => 
            <option key={quiz._id} value={quiz._id}>{quiz.name}</option>
        );

        return (
            <form id='selectQuiz' action={this.actionString + this.props.quizId}>
                <div className="form-group">
                    <label>Select a Quiz:</label>
                    <select className="form-control">
                        {options}
                    </select>
                    <small id="helpId" className="form-text text-muted">Select a Quiz</small>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        )
    }
}


// PRESENTATIONAL
class QuizApp extends React.Component {
    constructor(params) {
        super(params);
    }

    render() {

        return(
        <div className="limit-mt jumbotron jumbotron-fluid">
            <div className="container">
                <div className="row">
                    <div className="col-10">
                        <span className="text-primary" id="feedback">{this.props.feedback}</span>
                    </div>
                    <div id="timerContainer" className="col-2">{this.props.timeRemaining}</div>
                </div>

                <main id="quizMain">
                    
                    {!this.props.quizMode ? (
                    <div className="limit-mt jumbotron jumbotron-fluid">
                        <div className="container">
                            <h1 className="display-4">Main Quiz Interface</h1>
                            <div className="col-3">
                                <SelectQuiz quizzes={this.props.quizzes} />
                            </div>
                        </div>
                    </div>
                    ) : (
                        // <QuizActive />
                        <span>Test2</span>
                    )}
                </main>
            </div>
        </div>
        )
    }

    componentDidMount() {
        fetch('/quizReact/quizzes')
        .then(res => res.json())
        .then((quizzes) => {
            this.props.setQuizzes({quizzes});
        })
    }
}





const QuizAppConnnected = ReactRedux.connect(
  mapStateToProps,
  mapDispatchToProps
)(QuizApp);

const Provider = ReactRedux.Provider;

class QuizAppWrapped extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Provider store={store}>
                <QuizAppConnnected />
            </Provider>
        )
    }
}

ReactDOM.render(
    <QuizAppWrapped />,
    document.getElementById('quizReactApp')
)