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

document.getElementById('btnSubmitNewThread').addEventListener('click', e => {

    handlePostTextResponse('/api/threads/' + courseId, {
        text: document.getElementById('newThreadText').value
    }, (response) => {
        document.getElementById('feedback').innerHTML = response;
        loadMessageboardContent();
        document.getElementById('newThreadText').value = '';
    })

    e.preventDefault();
})

addThreadListeners = () => {

    Array.from(document.querySelectorAll('.btnReport')).forEach(el => {

        el.addEventListener('click', e => {
            
            let threadId = e.target.parentNode.querySelector('.id').innerText;
            let threadFeedback = e.target.parentNode.querySelector('.feedback');

            handlePutTextResponse('/api/threads/' + courseId, {threadId: threadId}, (response) => {
                threadFeedback.innerHTML = response;
            })
        })

    })

    Array.from(document.querySelectorAll('.btnDelete')).forEach(el => {

        el.addEventListener('click', e => {
            
            let threadId = e.target.parentNode.querySelector('.id').innerText;
            handleDelete('/api/threads/' + courseId, {threadId: threadId}, (response) => {
                loadMessageboardContent();
            })
        })

    })
}

loadMessageboardContent = () => {

    handleGet('/course/messageBoard/' + courseId, response => {
        document.getElementById('messageBoard').innerHTML = response;
        addThreadListeners();
    })
}

loadMessageboardContent();