// Things go into the state which affect the rendering
const initialState = {
}

const UPDATESTATE = 'UPDATESTATE';

const updateStateAction = (payload) => ({
    type: UPDATESTATE,
    payload
})

// // Thunk!
// const asyncGetQuizzesAndSetQuizIdAction = (quizzes) => {
//     return (dispatch, getState) => {
//         dispatch(updateStateAction({quizzes: quizzes}));
//         dispatch(updateStateAction({quizId: getState().quizzes[0]._id }))            
//     }
// }


const reducer = (state = initialState, { type, payload }) => {
    switch (type) {
    
        case UPDATESTATE:
            return { ...state, ...payload };

        default:
            return state
    }
}

const store = Redux.createStore(reducer);
// const store = Redux.createStore(reducer, Redux.applyMiddleware(ReduxThunk.default));

const mapStateToProps = (state) => {
    return {

    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateState: (payload) => {
            dispatch(updateStateAction(payload));
        }
        // asyncGetQuizzesAndSetQuizId: (quizzes) => {
        //     dispatch(asyncGetQuizzesAndSetQuizIdAction(quizzes));
        // }
    }
};

const QuizTimerConnnected = ReactRedux.connect(
    mapStateToProps,
    mapDispatchToProps
)(ActiveQuestion);

const Provider = ReactRedux.Provider;

class QuizTimerWrapped extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Provider store={store}>
                <QuizTimerConnnected />
            </Provider>
        )
    }
}

ReactDOM.render(
    <QuizTimerWrapped />,
    document.getElementById('quizTimer')
)