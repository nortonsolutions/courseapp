
        var currentQuestionId = 0;
        var currentQuizId = document.getElementById('quizId').innerText;
        
        applyQuestionListHandlers = () => {

            let questions = document.querySelectorAll('#questionList li');
            Array.from(questions).forEach(question => {
                question.addEventListener('click', (e) => {
                    currentQuestionId = e.target.id;
                    handleGet('/quizAdmin/' + currentQuizId + '/' + currentQuestionId, (response) => {
                        showQuestionForm();
                        document.getElementById('questionDetail').innerHTML = response;
                    })
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
            document.getElementById('feedback').innerHTML = 'Enter question details.';
            showQuestionForm();
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
            // console.log(formElements);

            let questionJson = {
                question: formElements[0].value,
                choices: [
                    { text: formElements[2].value, correct: formElements[1].checked},
                    { text: formElements[4].value, correct: formElements[3].checked},
                    { text: formElements[6].value, correct: formElements[5].checked},
                    { text: formElements[8].value, correct: formElements[7].checked}
                ],
                _id: formElements[9].value,
                type: 'multi'
            }

            // handlePost('/quizAdmin/' + currentQuizId, {question}, (response) => {
            //     if (/error/.test(response)) {
            //         document.getElementById('feedback').innerHTML = response;
            //     } else {
            //         currentQuestionId = 0;
            //         document.getElementById('feedback').innerHTML = "Successfully updated question.";
            //         document.getElementById('questionDetail').reset();
            //         rerenderQuestionList();
            //         rerenderQuestionDetail(() => {
            //             hideQuestionForm();
            //         });
            //     }
            // });

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
                if (callback) callback();
            })
        }

        applyQuestionListHandlers();
