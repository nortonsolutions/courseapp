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
        }
    });

    e.preventDefault();
})

document.getElementById('selectQuiz').addEventListener('submit', (e) => {
    let quizId = e.target.elements.quizSelect.value;
    let url = "/quizAdmin/" + quizId;
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
        homeContent: document.getElementById('homeContent').value
    };
    handlePut(url, data, (response) => {
        document.getElementById('feedback').innerHTML = response;
    });
})


if (admin) {

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
                addInstructorDeleteListeners();
    
            }
        });
    
        e.preventDefault();
    
    })

    addInstructorDeleteListeners = () => {
        Array.from(document.querySelectorAll('.deleteInstructor')).forEach(el => {
            el.addEventListener('click', e => {
                let instructorId = e.target.parentNode.querySelector('.instructorId').id;
                handleDelete('/courseAdmin/' + currentCourseId, { instructorId: instructorId }, response => {
                    if (/error:/.test(response)) {
                        document.getElementById('feedback').innerHTML = response;
                    } else {
                        document.getElementById('instructors').innerHTML = response;
                        addInstructorDeleteListeners();
    
                    }
                })
            })
        })
    }

    addInstructorDeleteListeners();
}




