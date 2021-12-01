var currentQuestionId = 0;
var currentQuizId = document.getElementById('quizId').innerText;
var currentCourseId = document.getElementById('courseId').innerText;


applyQuestionListHandlers = () => {

    let questions = document.querySelectorAll('#questionList .question');
    Array.from(questions).forEach(question => {
        question.addEventListener('click', (e) => {
            currentQuestionId = e.target.id;
            rerenderQuestionDetail();
        })
    })

    let deleteQuestions = document.querySelectorAll('#questionList .deleteQuestion');
    Array.from(deleteQuestions).forEach(deleteQuestion => {
        deleteQuestion.addEventListener('click', (e) => {
            if (confirm('Are you sure you want to delete this question?')) {

                questionIdToDelete = e.target.parentNode.querySelector('div:nth-child(2)').id;
                handleDelete('/quizAdmin/' + currentCourseId + '/' + currentQuizId + '/' + questionIdToDelete, {}, (response) => {
                    rerenderQuestionList();
                    document.getElementById('feedback').innerHTML = response;

                    if (currentQuestionId == questionIdToDelete) {
                        currentQuestionId = 0;
                        document.getElementById('questionDetail').reset();
                        rerenderQuestionDetail(() => {
                            hideQuestionForm();
                        });
                    }
                })
            }
            e.stopPropagation();
        })
    })
}

applyQuestionDetailHandlers = () => {
    document.getElementById('questionType').addEventListener('change', (e) => {
        switch (e.target.value) {
            case 'single':
                document.getElementById('responseCheckboxes').classList.remove('d-none');
                document.getElementById('responseText').classList.add('d-none');
                document.getElementById('responseEssay').classList.add('d-none');
                break;
            case 'multi':
                document.getElementById('responseCheckboxes').classList.remove('d-none');
                document.getElementById('responseText').classList.add('d-none');
                document.getElementById('responseEssay').classList.add('d-none');
                break;
            case 'text':
                document.getElementById('responseCheckboxes').classList.add('d-none');
                document.getElementById('responseText').classList.remove('d-none');
                document.getElementById('responseEssay').classList.add('d-none');
                break;
            case 'essay':
                document.getElementById('responseCheckboxes').classList.add('d-none');
                document.getElementById('responseText').classList.add('d-none');
                document.getElementById('responseEssay').classList.remove('d-none');
                break;
            default:  // instructional and projectSubmission
                document.getElementById('responseCheckboxes').classList.add('d-none');
                document.getElementById('responseText').classList.add('d-none');
                document.getElementById('responseEssay').classList.add('d-none');
                break;

        }
    })

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

    Array.from(document.querySelectorAll('.custom-file-input')).forEach(el => {
        el.addEventListener('change', e => {
            let filename = String(e.target.files[0].name);
            let ending = Array.from(filename).splice(-3,3).join('');
            let firstpart = filename.substring(0,filename.indexOf('.')).slice(0,8);
            e.target.labels[0].innerText = firstpart + "..." + ending;
        })
    })
}

showQuestionForm = () => {
    document.getElementById('questionDetail').classList.remove('d-none');
    document.getElementById('btnSaveQuestion').classList.remove('d-none');
    document.getElementById('btnCancel').classList.remove('d-none');
}

hideQuestionForm = () => {
    document.getElementById('questionDetail').classList.add('d-none');
    document.getElementById('btnSaveQuestion').classList.add('d-none');
    document.getElementById('btnCancel').classList.add('d-none');
}

document.getElementById('btnNewQuestion').addEventListener('click', () => {
    currentQuestionId = 0;
    rerenderQuestionDetail(() => {
        document.getElementById('feedback').innerHTML = 'Enter question details.';
        showQuestionForm();
    });
})

document.getElementById('btnCancel').addEventListener('click', () => {
    currentQuestionId = 0;
    rerenderQuestionDetail(() => {
        document.getElementById('feedback').innerHTML = '';
        hideQuestionForm()
    });

})

document.getElementById('btnSaveQuestion').addEventListener('click', (e) => {
    
    let formElements = document.getElementById('questionDetail').elements;

    let questionJson = {
        question: formElements.question.value,
        choices: [
            { text: formElements.text0.value, correct: formElements.checkbox0.checked},
            { text: formElements.text1.value, correct: formElements.checkbox1.checked},
            { text: formElements.text2.value, correct: formElements.checkbox2.checked},
            { text: formElements.text3.value, correct: formElements.checkbox3.checked}
        ],
        _id: formElements.questionId.value,
        type: formElements.questionType.value,
        answerTextRegex: formElements.answerTextRegex.value,
        answerEssayRegex: formElements.answerEssayRegex.value
    }

    var formData = new FormData(document.getElementById('questionDetail'));
    formData.append('questionJson', JSON.stringify(questionJson));

    handleFormPost('/quizAdmin/' + currentCourseId + '/' + currentQuizId, formData, (response) => {
        if (/error:/.test(response)) {
            document.getElementById('feedback').innerHTML = response;
        } else {
            currentQuestionId = 0;
            document.getElementById('feedback').innerHTML = "Successfully updated question.";
            document.getElementById('questionDetail').reset();
            rerenderQuestionList();
            addModalQuestionsListeners();
            rerenderQuestionDetail(() => {
                hideQuestionForm();
            });
        }
    })
});

document.getElementById('deleteQuiz').addEventListener('click', (e) => {
    
    if (confirm('Are you sure you want to delete this quiz?')) {
        handleDelete('/quizAdmin/' + currentCourseId + '/' + currentQuizId, {}, (response) => {
            window.location.href = encodeURI('/courseAdmin/' + currentCourseId + '?feedback=' + JSON.parse(response).response);
        })
    }
})

document.getElementById('saveQuiz').addEventListener('click', (e) => {
    
    handlePut('/quizAdmin/' + currentCourseId + '/' + currentQuizId, {
        quizDescription: document.getElementById('quizDescription').value,
        quizTimeLimit: document.getElementById('quizTimeLimit').value,
        quizMaxAttempts: document.getElementById('quizMaxAttempts').value
    }, (response) => {
        document.getElementById('feedback').innerHTML = response;
    });

})

rerenderQuestionList = (callback) => {
    handleGet('/quizAdmin/' + currentCourseId + '/' + currentQuizId + '/questions', (response) => {
        document.getElementById('questionListContainer').innerHTML = response;
        applyQuestionListHandlers();
        if (callback) callback();
    })
}

rerenderQuestionDetail = (callback) => {
    handleGet('/quizAdmin/' + currentCourseId + '/' + currentQuizId + '/' + currentQuestionId, (response) => {
        showQuestionForm();
        document.getElementById('questionDetail').innerHTML = response;
        applyQuestionDetailHandlers();
        addPreviewModalListeners();
        window.scroll(0,300);
        if (callback) callback();
    })
}


// Modal stuff

addModalQuestionsListeners = () => {

    reloadQuestionLists = () => {
        rerenderQuestionList();
        handleGet('/quizAdmin/modalQuestions/' + currentQuizId, (response) => {
            document.querySelector('.modal-body').innerHTML = response;
            addModalQuestionsListeners();
        })
    }

    Array.from(document.querySelectorAll('.orderLower')).forEach(el => {
        el.addEventListener('click', e => {
        
            // TODO: This would be an excellent place for CustomEvent, rather than
            // a call to grandfather node!
            let questionId = e.target.parentNode.parentNode.querySelector('.questionId').id
            handlePut('/quizAdmin/' + currentCourseId + '/' + currentQuizId, { questionId: questionId, changeSort: 'down'}, (response) => {
                reloadQuestionLists();                
            })
        })
    })

    Array.from(document.querySelectorAll('.orderHigher')).forEach(el => {
        el.addEventListener('click', e => {
        
            let questionId = e.target.parentNode.parentNode.querySelector('.questionId').id
            handlePut('/quizAdmin/' + currentCourseId + '/' + currentQuizId, { questionId: questionId, changeSort: 'up'}, (response) => {
                reloadQuestionLists();                
            })
        })
    })
}

addPreviewModalListeners = () => {
    Array.from(document.querySelectorAll('.btnTriggerPreviewModal')).forEach(el => {
        el.addEventListener('click', e => {
            document.querySelector('#modalBody').innerText = e.target.parentNode.parentNode.querySelector('textarea').innerHTML;
            Preview.callback();  // MathJax
        })
    })
}

applyQuestionListHandlers();
applyQuestionDetailHandlers();
addModalQuestionsListeners();
addPreviewModalListeners();


// MathJax:
var Preview = {
    CreatePreview: function () {
        MathJax.Hub.Queue(
            ["Typeset",MathJax.Hub,document.querySelector('#modalBody')]
        );
    },
};
  
Preview.callback = MathJax.Callback(["CreatePreview",Preview]);
Preview.callback.autoReset = true;  // make sure it can run more than once
// End of MathJax