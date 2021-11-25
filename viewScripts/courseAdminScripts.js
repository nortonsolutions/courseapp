var currentCourseId = document.getElementById('courseId').innerText;
var admin = document.getElementById('admin').innerText == "true";

document.getElementById('newQuiz').addEventListener('submit', (e) => {
    let url = "/courseAdmin/" + currentCourseId;
    let data = {
        quizName: e.target.elements.quizName.value 
    };
    handlePost(url, data, (response) => {
        if (/error/.test(response)) {
            document.getElementById('feedback').innerHTML = response;
        } else {
            document.getElementById('feedback').innerHTML = response;
            document.getElementById('newQuiz').reset();
            handleGet('/quizzes/' + currentCourseId, (response) => {
                document.getElementById('selectQuiz').innerHTML = response;
            })
            handleGet('/courseAdmin/modalModules/' + currentCourseId, (response) => {
                document.querySelector('.modal-body').innerHTML = response;
                addModalModulesListeners();
            })
        }
    });

    e.preventDefault();
})

document.getElementById('selectQuiz').addEventListener('submit', (e) => {
    let quizId = e.target.elements.quizSelect.value;
    let url = "/quizAdmin/" + currentCourseId + "/" + quizId;
    window.location.href = url;
    e.preventDefault();
})

document.getElementById('deleteCourse').addEventListener('click', (e) => {
    
    if (confirm('Are you sure you want to delete this course?')) {
        handleDelete('/courseAdmin', { courseId: currentCourseId }, (response) => {
            window.location.href = encodeURI('/admin?feedback=' + response);
        })
    }
})

document.getElementById('saveCourseDetails').addEventListener('click', e => {
    let url = "/courseAdmin/" + currentCourseId;
    let data = {
        description: document.getElementById('description').value,
        homeContent: document.getElementById('homeContent').value,
        currentTermStartDate: document.getElementById('currentTermStartDate').value + "T12:00:00-06:00"
    };
    handlePut(url, data, (response) => {
        document.getElementById('feedback').innerHTML = response;
    });
})


addInstructorAddListener = () => {
    document.getElementById('selectTeachers').addEventListener('submit', e => {
        let url = "/courseAdmin/" + currentCourseId;
        let data = {
            instructorId: e.target.elements.instructorId.value 
        };
        handlePutTextResponse(url, data, (response) => {
            if (/error:/.test(response)) {
                document.getElementById('feedback').innerHTML = response;
            } else {
                document.getElementById('instructors').innerHTML = response;
                addInstructorAddListener();
                addInstructorDeleteListeners();
    
            }
        });
    
        e.preventDefault();
    
    })
}


addInstructorDeleteListeners = () => {
    Array.from(document.querySelectorAll('.deleteInstructor')).forEach(el => {
        el.addEventListener('click', e => {
            let instructorId = e.target.parentNode.querySelector('.instructorId').id;
            handleDelete('/courseAdmin/' + currentCourseId, { instructorId: instructorId }, response => {
                if (/error:/.test(response)) {
                    document.getElementById('feedback').innerHTML = response;
                } else {
                    document.getElementById('instructors').innerHTML = response;
                    addInstructorAddListener();
                    addInstructorDeleteListeners();

                }
            })
        })
    })
}

if (admin) {
    addInstructorAddListener();
    addInstructorDeleteListeners();
}

// Modal stuff

addModalModulesListeners = () => {

    reloadModuleLists = () => {
        handleGet('/quizzes/' + currentCourseId, (response) => {
            document.getElementById('selectQuiz').innerHTML = response;
        })
    
        handleGet('/courseAdmin/modalModules/' + currentCourseId, (response) => {
            document.querySelector('.modal-body').innerHTML = response;
            addModalModulesListeners();
        })
    }

    Array.from(document.querySelectorAll('.orderLower')).forEach(el => {
        el.addEventListener('click', e => {
        
            // TODO: This would be an excellent place for CustomEvent, rather than
            // a call to grandfather node!
            let quizId = e.target.parentNode.parentNode.querySelector('.quizId').id
            handlePut('/courseAdmin/' + currentCourseId, { quizId: quizId, changeSort: 'down'}, (response) => {
                reloadModuleLists();                
            })
        })
    })

    Array.from(document.querySelectorAll('.orderHigher')).forEach(el => {
        el.addEventListener('click', e => {
        
            let quizId = e.target.parentNode.parentNode.querySelector('.quizId').id
            handlePut('/courseAdmin/' + currentCourseId, { quizId: quizId, changeSort: 'up'}, (response) => {
                reloadModuleLists();
            })
        })
    })
}

addModalModulesListeners();


