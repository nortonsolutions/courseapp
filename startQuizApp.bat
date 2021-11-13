set SESSION_SECRET=WHATEVER
set PORT=3000
set DB=mongodb://localhost:27018/nortonQuiz
set NODE_ENV=test
set ALLOW_TEST_REVIEWS=true
set SHOW_ANSWERS_ON_REVIEWS=true

utils\node\node.exe server.js