var currentCourseId = document.getElementById('courseId').innerText;

document.getElementById('newQuiz').addEventListener('submit', (e) => {
    let url = "/courseAdmin";
    let data = {
        courseId: currentCourseId,
        quizName: e.target.elements.quizName.value 
    };
    handlePost(url, data, (response) => {
        if (/error/.test(response)) {
            document.getElementById('feedback').innerHTML = response;
        } else {
            document.getElementById('feedback').innerHTML = response;
            document.getElementById('newQuiz').reset();
            handleGet('/quizzes', (response) => {
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
        handleDelete('/courseAdmin/' + currentCourseId, (response) => {
            window.location.href = encodeURI('/admin?feedback=' + JSON.parse(response).response);
        })
    }
})
