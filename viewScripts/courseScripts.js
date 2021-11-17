var courseId = document.getElementById('courseId').value;

document.getElementById('homeContentMarked').innerHTML = marked(document.getElementById('homeContentRaw').innerText)
document.getElementById('selectQuiz').addEventListener('submit', (e) => {
    if (confirm("Are you ready to start the quiz?")) {

        let userId = document.getElementById('userId').value
        let quizId = e.target.elements.quizSelect.value;
        localStorage.removeItem(userId + quizId);
        window.location.href = '/quizActive/' + quizId;

    }
    e.preventDefault();
})

document.getElementById('newThread').addEventListener('submit', e => {

    handlePostTextResponse('/api/threads/' + courseId, {
        text: document.getElementById('newThreadText').value
    }, (response) => {
        document.getElementById('feedback').innerHTML = response;
    })

    e.preventDefault();
})