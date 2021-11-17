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
            let threadId = e.target.parentNode.querySelector('.threadId').innerText;
            let threadFeedback = e.target.parentNode.querySelector('.feedback');
            handlePutTextResponse('/api/threads/' + courseId, {threadId: threadId}, (response) => {
                threadFeedback.innerHTML = response;
            })
        })
    })

    Array.from(document.querySelectorAll('.btnDelete')).forEach(el => {
        el.addEventListener('click', e => {

            if (confirm("Are you sure?")) {
                let threadId = e.target.parentNode.querySelector('.threadId').innerText;
                handleDelete('/api/threads/' + courseId, {threadId: threadId}, (response) => {
                    loadMessageboardContent();
                })
            }

        })
    })

    Array.from(document.querySelectorAll('.btnReportReply')).forEach(el => {

        el.addEventListener('click', e => {
            let threadId = e.target.parentNode.querySelector('.threadId').innerText;
            let replyId = e.target.parentNode.querySelector('.replyId').innerText;
            let threadFeedback = e.target.parentNode.querySelector('.feedback');
            handlePutTextResponse('/api/replies/' + courseId, {threadId: threadId, replyId: replyId}, (response) => {
                threadFeedback.innerHTML = response;
            })
        })
    })

    Array.from(document.querySelectorAll('.btnDeleteReply')).forEach(el => {
        el.addEventListener('click', e => {

            if (confirm("Are you sure?")) {
                let threadId = e.target.parentNode.querySelector('.threadId').innerText;
                let replyId = e.target.parentNode.querySelector('.replyId').innerText;
                handleDelete('/api/replies/' + courseId, {threadId: threadId, replyId: replyId}, (response) => {
                    loadMessageboardContent();
                })
            }

        })
    })


    Array.from(document.querySelectorAll('.btnSubmitNewReply')).forEach(el => {
        el.addEventListener('click', e => {

            let threadId = e.target.parentNode.querySelector('.threadId').innerText;
            let newReplyText = e.target.parentNode.querySelector('.newReplyText').value;
            
            handlePost('/api/replies/' + courseId, {
                text: newReplyText,
                threadId: threadId

            }, (response) => {
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