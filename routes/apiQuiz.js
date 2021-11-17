/*
* Norton 2021 - quiZap
*
*/

var cookie             = require('cookie');

const blankQuestion = {
    _id: 0,
    type: 'single',
    question: '',
    choices: [
        { text: '', correct: false},
        { text: '', correct: false},
        { text: '', correct: false},
        { text: '', correct: false}
    ],
    imageLocation: '',
    answerTextRegex: '',
    answerEssayRegex: ''
  }

module.exports = function(app, db, upload) {    

    // Allow test reviews and show answers?
    var allowTestReviews = process.env.ALLOW_TEST_REVIEWS == 'true';
    var showAnswers = process.env.SHOW_ANSWERS_ON_REVIEWS == 'true';

    // ensureAuthenticated
    const ensureAuthenticated = (req,res,next) => {
        if (req.isAuthenticated()) {
        return next();
        }
        res.redirect('/');
    };

    // ensureAuthenticated
    const ensureAdmin = (req,res,next) => {
        db.models.User.findOne({ username: req.user.username }, 'username roles', (err, user) => {
        if (user.roles.includes('admin')) {
            next();
        } else {
            res.redirect('/main');
        }     
        })
    };

    // ensureAdminOrTeacher - unique for quiz route
    const ensureAdminOrTeacher = (req,res,next) => {
        let quizId = req.params.quizId;
        
        db.models.User.findOne({ username: req.user.username }, 'username roles', (err, user) => {
        if (user.roles.includes('admin')) {
            next();
        } else {
            if (user.roles.includes('teacher')) {
                db.models.Course.findOne()
                .and([{'quizIds': quizId }, {'instructors.instructorId': req.user.id}])
                .exec((err,course) => {
                    if (course) {
                        next();
                    } else {
                        res.redirect('/main');
                    }
                })

            } else {
                res.redirect('/main');
            }
        }     
        })
    };

    
    // Grab list of quizzes for selectQuiz partial
    app.route('/quizzes/:courseId')
        .get(ensureAuthenticated, (req,res) => {
        let options = {
            admin: req.user.roles.includes('admin')
        };
        
        db.models.Course.findOne({ _id : req.params.courseId}, (err, course) => {
            if (err) {
                res.json({error: err.message});
            } else {
                options.course = course;
                db.models.Quiz.find().where('_id').in(course.quizIds).exec((err, quizzes) => {
                    if (err) {
                        res.json({error: err.message});
                    } else {
                        options.quizzes = quizzes;
                        res.render(process.cwd() + '/views/partials/selectQuiz.hbs', options);
                    }
                })
            }
        })
    })


    app.route('/quiz/grade/:quizId')
        .post(ensureAuthenticated, (req,res) => {
  
        let quizId = req.params.quizId;
        let userAnswers = req.body.userAnswers;
    
        db.models.Quiz.findOne({_id: quizId}, (err,quiz) => {
            if (err) {
            res.json({error: err.message});
            } else {

            db.models.User.findOne({_id: req.user._id}, (err,user) => {
                if (err) {
                res.json({error: err.message});
                } else {
                
                var totalQuestions = quiz.questions.length;
                var totalMissed = 0;

                userAnswers.forEach(userAnswer => {
                    
                    let correctAnswer = true;

                    // Is the answer correct?  Compare against the quizId/questionId
                    var question = quiz.questions.id(userAnswer.questionId);
                    var wrong = 0;

                    if (question.type == 'single' || question.type == 'multi') {
                    wrong = question.choices.reduce((total, current, index) => {
                        return total + (current.correct != userAnswer.answer[index]);
                    }, 0)
                    userAnswer.correct = (wrong == 0);

                    } else if (question.type == 'text') {
                    userAnswer.correct = RegExp(question.answerTextRegex).test(userAnswer.answerText);

                    } else if (question.type == 'essay') {
                    userAnswer.correct = RegExp(question.answerEssayRegex).test(userAnswer.answerEssay);
                    }

                    if (!userAnswer.correct) totalMissed++;
                })

                let score = ((totalQuestions - totalMissed) / totalQuestions).toFixed(2);

                user.quizzes = [...user.quizzes, {
                    quizId: quizId,
                    answers: userAnswers,
                    score: score*100,
                    date: new Date(),
                    quizName: quiz.name
                }];

                user.save((err,doc) => {
                    if (err) {
                    res.json({feedback: err.message});
                    } else {
                    res.json({feedback: "You scored " + score*100 + "%"});
                    }
                })
                }
            })
            }
        });
    });

    app.route('/quiz')
        // Get and return the userQuiz:
        .post(ensureAuthenticated, (req,res) => {
            let userQuizId = req.body.userQuizId;
    
            db.models.User.findOne({_id: req.user._id}, (err,user) => {
            if (err) {
                res.json({error: err.message});
            } else {
                let subDoc = user.quizzes.id(userQuizId);
                
                let responseJson = {
                    answers: subDoc.answers,
                    id: subDoc.id,
                    quizId: subDoc.quizId,
                    quizName: subDoc.quizName,
                    score: subDoc.score,
                    userId: req.user.id
                }
                res.json(responseJson);
            }
            })
        }) 

    app.route('/quizAdmin/:quizId')

    // Get entire quizAdmin view for a quiz
    .get(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
        let quizId = req.params.quizId;

        let options = {
            admin: req.user.roles.includes('admin'),
            currentQuestion: blankQuestion
        };

        db.models.Quiz.findOne({_id: quizId}, (err,quiz) => {
            if (err) {
            res.json({error: err.message});
            } else {
            options.quiz = quiz
            res.render(process.cwd() + '/views/quizAdmin.hbs', options);
            }
        })
        })

    // Post question for the quiz
    .post(
        ensureAuthenticated, 
        ensureAdminOrTeacher, 
        upload.single('file'), // req.file
        (req,res) => {
            let quizId = req.params.quizId;
            let question = JSON.parse(req.body.questionJson);
            db.models.Quiz.findOne({_id: quizId}, (err,doc) => {
            
            if (question._id == 0) {
                // add new question
                doc.questions = [...doc.questions, { 
                question: question.question, 
                choices: question.choices,
                type: question.type,
                imageLocation: req.file? req.file.originalname: '',
                answerTextRegex: question.answerTextRegex,
                answerEssayRegex: question.answerEssayRegex
                }];

            } else {
                // update existing question
                var subDoc = doc.questions.id(question._id);
                subDoc.question = question.question;
                subDoc.choices = question.choices;
                subDoc.type = question.type;
                subDoc.answerTextRegex = question.answerTextRegex;
                subDoc.answerEssayRegex = question.answerEssayRegex;

                if (req.file) {
                subDoc.imageLocation = req.file.originalname;
                }
            }
            
            doc.save((err,doc) => {
                if (err) {
                res.json({error: err.message});
                } else {
                res.json(doc);
                }
            })
            })
        })

    .delete(ensureAuthenticated, ensureAdmin, (req,res) => {
        let quizId = req.params.quizId;
        db.models.Quiz.remove({_id: quizId}, (err) => {
            if (err) {
                res.json({error: err.message});
            } else {

                // Clean up references to this quizId
                db.models.Course.find({}, (err, courses) => {
                    if (err) {
                        res.json({error: err.message});
                    } else {
                        courses.forEach(course => {
                            course.quizIds = course.quizIds.filter(el => el != quizId);
                            course.save();
                        })
                        res.json({response: 'Successfully removed quiz.'});
                    }
                })
            }
        });
    })

    .put(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
    db.models.Quiz.findOne({_id: req.params.quizId}, (err,quiz) => {
        if (err) {
        res.json({error: err.message});
        } else {
        quiz.description = req.body.quizDescription;
        quiz.timeLimit = req.body.quizTimeLimit;
        quiz.maxAttempts = req.body.quizMaxAttempts;
        quiz.save(err => {
            if (err) {
            res.json({error: err.message});
            } else {
            res.json({response: 'Successfully updated quiz.'});
            } 
        })
        }
    })
    })

    app.route('/quizAdmin/:quizId/questions')

    // Grab list of questions for questionList partial
    .get(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
    let quizId = req.params.quizId;
    let options = {};

    db.models.Quiz.findOne({_id: quizId}, 'name questions', (err,quiz) => {
        if (err) {
        res.json({error: err.message});
        } else {
        options.quiz = quiz
        res.render(process.cwd() + '/views/partials/questionList.hbs', options);
        }
    })
    })

    app.route('/quizAdmin/:quizId/:questionId')

    // Grab question details for questionDetail partial
    .get(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
    let questionId = req.params.questionId;
    let quizId = req.params.quizId;
    let options = {}

    if (questionId == 0) {
        options.currentQuestion = blankQuestion;
        res.render(process.cwd() + '/views/partials/questionDetail.hbs', options);
    } else {
        db.models.Quiz.findOne({_id: quizId}, (err,quiz) => {
        if (err) {
            res.json({error: err.message});
        } else {
            options.currentQuestion = quiz.questions.find(el => el._id == questionId);
            res.render(process.cwd() + '/views/partials/questionDetail.hbs', options);
        }
        })
    }
    })

    // Remove the question
    .delete(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
    let questionId = req.params.questionId;
    let quizId = req.params.quizId;
    let options = {}

        db.models.Quiz.findOne({_id: quizId}, (err,quiz) => {
        if (err) {
            res.json({error: err.message});
        } else {

            var index = quiz.questions.findIndex((el) => { return el._id == questionId})
            quiz.questions.splice(index, 1);
            quiz.save(err => {
            if (err) {
                res.json({error: err.message});
            } else {
                res.json({response: 'Successfully removed question.'});
            }
            })
        }
        })
    })

    app.route('/course/:courseId')

        .get(ensureAuthenticated, (req,res) => {

            let options = { admin: req.user.roles.includes('admin') };
            
            db.models.Course.findOne({ _id : req.params.courseId}, (err, course) => {
                if (err) {
                    res.json({error: err.message});
                } else {
                    options.course = course;
                    db.models.Quiz.find().where('_id').in(course.quizIds).select('name').exec((err, quizzes) => {
                        if (err) {
                            res.json({error: err.message});
                        } else {
                            options.quizzes = quizzes;
                            options.userId = req.user._id;
                            res.render(process.cwd() + '/views/course.hbs', options);
                        }
                    })
                }
            })
        })
    
    app.route('/quizActive/:quizId')

        // Get and render the active quiz container:
        .get(ensureAuthenticated, (req,res) => {
    
          let quizId = req.params.quizId;
          let options = {
              quizId: req.params.quizId,
              admin: req.user.roles.includes('admin'),
          }

          if (req.headers.referer && req.headers.referer.match(/profile/)) {
              res.cookie(req.user.id, quizId);
              options.reviewMode = true;
          } else {
              res.clearCookie(req.user.id);
          }
    
          db.models.Quiz.findOne({_id: quizId}, (err,quiz) => {
            if (err) {
              res.json({error: err.message});
            } else {
              options.quizName = quiz.name;
              options.timeLimit = quiz.timeLimit;
              options.maxAttempts = quiz.maxAttempts;
              options.totalQuestions = quiz.questions.length;
              
              options.userId = req.user._id;
              res.render(process.cwd() + '/views/quizActive.hbs', options);
            }
          })
    })

    app.route('/quizActive/:quizId/:index')

        // Get and render the quiz question:
        .get(ensureAuthenticated, (req,res) => {
    
          let quizId = req.params.quizId;

          // Set reviewMode?
          var reviewMode = false;
          var cookies = cookie.parse(req.headers.cookie || '');
          if (Object.keys(cookies).length > 0) {
              reviewMode = Array.from(Object.keys(cookies)).includes(req.user.id) && cookies[req.user.id] == quizId;
          }

          let options = {
              quizId: req.params.quizId,
              currentQuestionNumber: Number(req.params.index) + 1,
              admin: req.user.roles.includes('admin'),
              reviewMode: reviewMode,
              showAnswers: showAnswers
          }
    
          db.models.Quiz.findOne({_id: quizId}, (err,quiz) => {
            if (err) {
              res.json({error: err.message});
            } else {
              options.currentQuestion = quiz.questions[req.params.index];
              res.render(process.cwd() + '/views/partials/quizQuestion.hbs', options);
            }
          })
    })
}