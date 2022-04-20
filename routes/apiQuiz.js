/*
* Norton 2021 - CourseApp
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
    videoLocation: '',
    answerTextRegex: '',
    answerEssayRegex: '',
  }

module.exports = function(app, db, upload, uploadProject) {    

    // Show answers?
    var showAnswers = process.env.SHOW_ANSWERS_ON_REVIEWS == 'true';

    // ensureAuthenticated
    const ensureAuthenticated = (req,res,next) => {
        if (req.isAuthenticated()) {
        return next();
        }
        res.redirect('/');
    };

    // ensureAdminOrTeacher
    const ensureAdminOrTeacher = (req, res, next) => {
        if (req.user.roles.includes('admin')) {
            next();
        } else {
            if (req.user.roles.includes('teacher')) {
                let courseId = req.params.courseId;
                
                db.models.Course.findOne()
                    .and([{ _id: courseId }, { 'instructors.instructorId': req.user.id }])
                    .exec((err, course) => {
                        if (course) {
                        req.user.currentTeacher = true;
                        next();
                        }
                    })
            } else {
                res.redirect('/main');
            }
        }
    };
    
    // Grab list of quizzes for selectQuiz partial
    app.route('/quizzes/:courseId')
        .get(ensureAuthenticated, (req,res) => {
        let options = {
            admin: req.user.roles.includes('admin')
        };
        
        db.models.Course.findOne({ _id : req.params.courseId}, 'name quizIds', (err, course) => {
            if (err) {
                res.json({error: err.message});
            } else {
                options.course = course;
                
                db.models.Quiz.find().where('_id').in(course.quizIds.map(el => el.quizId)).select('name').sort({ name: 1 }).exec((err, quizzes) => {
                    if (err) {
                        res.json({error: err.message});
                    } else {

                        // Re-sort just in case data was imported
                        var sortLookupTable = {}
                        Array.from(course.quizIds).forEach(el => {
                            sortLookupTable[el.quizId] = el.sortKey;
                        })
                        
                        options.quizzes = Array.from(quizzes).sort((a,b) => {
                            return sortLookupTable[a.id] - sortLookupTable[b.id]
                        });

                        res.render('partials/selectQuiz.hbs', options);
                    }
                })
            }
        })
    })


    app.route('/quiz/grade/:courseId/:quizId')
        .post(ensureAuthenticated, (req,res) => {
        
        let courseId = req.params.courseId;
        let quizId = req.params.quizId;
        let userAnswers = req.body.userAnswers;
        let timePassed = req.body.timePassed;
    
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

                Object.keys(userAnswers).forEach(questionId => {
                    
                    let correctAnswer = true;

                    // Is the answer correct?  Compare against the quizId/questionId
                    var question = quiz.questions.id(questionId);
                    var wrong = 0;

                    if (question.type == 'single' || question.type == 'multi') {
                    wrong = question.choices.reduce((total, current, index) => {
                        return total + (current.correct != userAnswers[questionId].answer[index]);
                    }, 0)
                        userAnswers[questionId].correct = (wrong == 0);

                    } else if (question.type == 'text') {
                        userAnswers[questionId].correct = RegExp(question.answerTextRegex).test(userAnswers[questionId].answerText);

                    } else if (question.type == 'essay') {
                        userAnswers[questionId].correct = RegExp(question.answerEssayRegex).test(userAnswers[questionId].answerEssay);
                    } else {
                        userAnswers[questionId].correct = true;
                    }

                    if (!userAnswers[questionId].correct) totalMissed++;
                })

                // How many questions were unanswered?  Add to totalMissed tally:
                totalMissed += (totalQuestions - Object.keys(userAnswers).length);

                let score = ((totalQuestions - totalMissed) / totalQuestions).toFixed(2);

                user.quizzes = [...user.quizzes, {
                    courseId: courseId,
                    quizId: quizId,
                    answers: userAnswers,
                    score: score*100,
                    date: new Date(),
                    quizName: quiz.name,
                    timePassed: timePassed
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

    app.route('/quiz/projectSubmission/:courseId/:quizId')
        .post(
            ensureAuthenticated,
            uploadProject.single('file'),
            (req,res) => {
                let courseId = req.params.courseId;
                let quizId = req.params.quizId;
                let userAnswers = JSON.parse(req.body.userAnswers);
                let timePassed = req.body.timePassed;
                let projectFile = req.body.projectFile;
            
                db.models.Quiz.findOne({_id: quizId}, (err,quiz) => {
                    if (err) {
                    res.json({error: err.message});
                    } else {
        
                        db.models.User.findOne({_id: req.user._id}, (err,user) => {
                            if (err) {
                                res.json({error: err.message});
                            } else {

                                user.quizzes = [...user.quizzes, {
                                    courseId: courseId,
                                    quizId: quizId,
                                    answers: userAnswers,
                                    score: 70,
                                    date: new Date(),
                                    quizName: quiz.name,
                                    timePassed: timePassed
                                }];
                
                                user.projects = [...user.projects, {
                                    courseId: courseId,
                                    quizId: quizId,
                                    file: projectFile,
                                    date: new Date()
                                }]

                                user.save((err,doc) => {
                                    if (err) {
                                    res.json({feedback: err.message});
                                    } else {
                                    res.json({feedback: "Success.  Score is 70 until graded."});
                                    }
                                })
                            }
                        });
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
                    timePassed: subDoc.timePassed,
                    userId: req.user.id
                }
                res.json(responseJson);
            }
            })
        }) 

    app.route('/quizAdmin/modalQuestions/:quizId/')
        .get(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
            let quizId = req.params.quizId;

            let options = {
                admin: req.user.roles.includes('admin'),
                feedback: req.query.feedback? req.query.feedback : ''
            };
            
            db.models.Quiz.findOne({ _id : quizId})
                .exec((err, quiz) => {
                if (err) {
                    res.json({error: err.message});
                } else {
                    options.quiz = quiz;
                    options.questionsHighIndex = quiz.questions.length - 1;
                    res.render('partials/modalQuestions.hbs', options);
                }
            })
        })

    app.route('/quizAdmin/:courseId/:quizId')

        // Get entire quizAdmin view for a quiz
        .get(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
            let quizId = req.params.quizId;
            let courseId = req.params.courseId;

            let options = {
                admin: req.user.roles.includes('admin'),
                currentQuestion: blankQuestion
            };

            db.models.Quiz.findOne({_id: quizId}, (err,quiz) => {
                if (err) {
                res.json({error: err.message});
                } else {
                options.quiz = quiz;
                options.courseId = courseId;
                options.questionsHighIndex = quiz.questions.length - 1;
                res.render('quizAdmin.hbs', options);
                }
            })
            })

        // Post question for the quiz
        .post(
            ensureAuthenticated, 
            ensureAdminOrTeacher, 
            // upload.single('file'), // req.file
            upload.fields([{ name: 'file', maxCount: 1 }, { name: 'video', maxCount: 1 }]),
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
                    imageLocation: req.files? req.files.file? req.files.file[0].originalname: '': '',
                    videoLocation: req.files? req.files.video? req.files.video[0].originalname: '': '',
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

                    if (req.files) {
                        if (req.files.file) {
                            subDoc.imageLocation = req.files.file[0].originalname;
                        }
        
                        if (req.files.video) {
                            subDoc.videoLocation = req.files.video[0].originalname;
                        }
        
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

        .delete(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
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
                                course.quizIds = course.quizIds.filter(el => el.quizId != quizId);
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

                    if (req.body.changeSort) {
                        // Find the index of the current quizQuestion
                        let questionId = req.body.questionId;
                        let index = quiz.questions.findIndex(el => el.id == questionId);
                        let indexToSwap = req.body.changeSort == "up"? index - 1: index + 1;
                        let itemToMove = quiz.questions.splice(index,1)[0];
                        quiz.questions = [...quiz.questions.slice(0,indexToSwap), itemToMove, ...quiz.questions.slice(indexToSwap,quiz.questions.length)];
                        quiz.save(err => {
                            if (err) {
                                res.json({error: err.message});
                            } else {
                                res.json({response: 'Successfully updated quiz.'});
                            } 
                        })

                    } else {
                        quiz.description = req.body.quizDescription;
                        quiz.timeLimit = req.body.quizTimeLimit;
                        quiz.maxAttempts = req.body.quizMaxAttempts;
                        quiz.minPassingGrade = req.body.quizMinPassingGrade;
                        quiz.save(err => {
                            if (err) {
                                res.json({error: err.message});
                            } else {
                                res.json({response: 'Successfully updated quiz.'});
                            } 
                        })
                    }
                }
            })
        })

    

    app.route('/quizAdmin/:courseId/:quizId/questions')

        // Grab list of questions for questionList partial
        .get(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
            let quizId = req.params.quizId;
            let options = {};

            db.models.Quiz.findOne({_id: quizId}, 'name questions', (err,quiz) => {
                if (err) {
                res.json({error: err.message});
                } else {
                options.quiz = quiz
                res.render('partials/questionList.hbs', options);
                }
            })
        })



    app.route('/quizAdmin/:courseId/:quizId/:questionId')

        // Grab question details for questionDetail partial
        .get(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
            let questionId = req.params.questionId;
            let quizId = req.params.quizId;
            let options = {}

            if (questionId == 0) {
                options.currentQuestion = blankQuestion;
                res.render('partials/questionDetail.hbs', options);
            } else {
                db.models.Quiz.findOne({_id: quizId}, (err,quiz) => {
                if (err) {
                    res.json({error: err.message});
                } else {
                    options.currentQuestion = quiz.questions.find(el => el._id == questionId);
                    res.render('partials/questionDetail.hbs', options);
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




    
    app.route('/quizActive/:courseId/:quizId')

        // Get and render the active quiz container:
        .get(ensureAuthenticated, (req,res) => {
    
          let courseId = req.params.courseId;
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
              options.description = quiz.description;
              options.timeLimit = quiz.timeLimit;
              options.maxAttempts = quiz.maxAttempts;
              options.totalQuestions = quiz.questions.length;

              options.courseId = courseId;
              options.userId = req.user._id;
              res.render('quizActive.hbs', options);
            }
          })
    })

    app.route('/quizActive/:courseId/:quizId/:index')

        // Get and render the quiz question:
        .get(ensureAuthenticated, (req,res) => {
    
          let courseId = req.params.courseId;  
          let quizId = req.params.quizId;

          // Set reviewMode?
          var reviewMode = false;
          var cookies = cookie.parse(req.headers.cookie || '');
          if (Object.keys(cookies).length > 0) {
              reviewMode = Array.from(Object.keys(cookies)).includes(req.user.id) && cookies[req.user.id] == quizId;
          }

          let options = {
              courseId: courseId,
              quizId: quizId,
              currentQuestionNumber: Number(req.params.index) + 1,
              admin: req.user.roles.includes('admin'),
              reviewMode: reviewMode,
              showAnswers: showAnswers
          }
    
          db.models.Quiz.findOne({_id: quizId}, (err,quiz) => {
            if (err) {
              res.json({error: err.message});
            } else {
              options.totalQuestions = quiz.questions.length  
              options.currentQuestion = quiz.questions[req.params.index];
              res.render('partials/quizQuestion.hbs', options);
            }
          })
    })
}