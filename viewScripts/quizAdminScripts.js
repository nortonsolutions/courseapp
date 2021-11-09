var currentQuestionId = 0;
var currentQuizId = document.getElementById('quizId').innerText;

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
                handleDelete('/quizAdmin/' + currentQuizId + '/' + questionIdToDelete, (response) => {
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

    handleFormPost('/quizAdmin/' + currentQuizId, formData, (response) => {
        if (/error/.test(response)) {
            document.getElementById('feedback').innerHTML = response;
        } else {
            currentQuestionId = 0;
            document.getElementById('feedback').innerHTML = "Successfully updated question.";
            document.getElementById('questionDetail').reset();
            rerenderQuestionList();
            rerenderQuestionDetail(() => {
                hideQuestionForm();
            });
        }
    })
});

document.getElementById('deleteQuiz').addEventListener('click', (e) => {
    
    if (confirm('Are you sure you want to delete this quiz?')) {
        handleDelete('/quizAdmin/' + currentQuizId, (response) => {
            window.location.href = encodeURI('/admin?feedback=' + JSON.parse(response).response);
        })
    }
})

document.getElementById('saveQuiz').addEventListener('click', (e) => {
    
    handlePut('/quizAdmin/' + currentQuizId, {
        quizDescription: document.getElementById('quizDescription').value,
        quizTimeLimit: document.getElementById('quizTimeLimit').value,
        quizMaxAttempts: document.getElementById('quizMaxAttempts').value
    }, (response) => {
        document.getElementById('feedback').innerHTML = response;
    });

})

rerenderQuestionList = (callback) => {
    handleGet('/quizAdmin/' + currentQuizId + '/questions', (response) => {
        document.getElementById('questionListContainer').innerHTML = response;
        applyQuestionListHandlers();
        if (callback) callback();
    })
}

rerenderQuestionDetail = (callback) => {
    handleGet('/quizAdmin/' + currentQuizId + '/' + currentQuestionId, (response) => {
        showQuestionForm();
        document.getElementById('questionDetail').innerHTML = response;
        applyQuestionDetailHandlers();
        if (callback) callback();
    })
}

applyQuestionListHandlers();
applyQuestionDetailHandlers();
