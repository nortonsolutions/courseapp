/*
* Norton 2021 - QuizApp
*
*/

'use strict';

var expect            = require('chai').expect;
var bcrypt            = require('bcrypt');
var passport          = require('passport');

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


module.exports = function (app, db, upload) {

    // Allow test reviews and show answers?
    var allowTestReviews = process.env.ALLOW_TEST_REVIEWS == 'true';
    var showAnswers = process.env.SHOW_ANSWERS_ON_REVIEWS == 'true';;

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


    app.route('/')
        // Get and render the index view
        .get((req,res) => {
        
        
        let options = {
            welcomeMessage: "Welcome to QuizApp!",
            showRegistration: false,
            showLogin: true
        }

        if (req.query.failedLogin) options.alertText = "Failed login.";

        res.render(process.cwd() + '/views/index.hbs', options);
        })

    app.route('/login')
        // Login
        .post(passport.authenticate('local', { successRedirect: '/main', failureRedirect: '/?failedLogin=true' }))


    app.route('/register')
        // Register a new user
        .post(
        (req, res, next) => {
            db.models.User.findOne({ username: req.body.username }, function(
            err,
            user
            ) {
            if (err) {
                next(err);
            } else if (user) {
                res.redirect("/");
            } else {
                bcrypt.hash(req.body.password, 12).then(hash => {
                db.models.User.create(
                    { 
                    username: req.body.username, 
                    password: hash,
                    surname: req.body.surname,
                    firstname: req.body.firstname
                    },
                    (err, doc) => {
                    if (err) {
                        res.redirect("/");
                    } else {
                        next(null, user);
                    }
                    }
                );
                });
            }
            });
        },
        passport.authenticate("local", { failureRedirect: "/?failedLogin=true" }),
        (req, res, next) => {
            res.redirect("/main");
        }
        );

    app.route('/deleteAccount')
        .post(ensureAuthenticated, ensureAdmin, (req,res) => {
        db.models.User.remove({_id: req.body._id}, (err,body) => {
            if (err) {
            res.json({error: err.message});
            } else {
            db.models.User.find({}, 'username firstname surname', (err,users) => {
                if (err) {
                res.json({error: err.message});
                } else {
                res.render(process.cwd() + '/views/partials/selectUser.hbs', {users: users});
                }
            })
            }
        })
        })

    app.route('/updateAccount')
        .post(ensureAuthenticated,(req,res) => {
        db.models.User.findOne({_id : req.body._id}, (err,user) => {
            if (err) {
            res.json({error: err.message});
            } else {

            if (req.body.password != req.body.confirm) {
                res.json({error: "Password and Confirm values must match."});
            } else {

                user.username = req.body.username;
                user.firstname = req.body.firstname;
                user.surname = req.body.surname;

                if (req.body.password) {
                bcrypt.hash(req.body.password, 12).then(hash => {
                    user.password = hash;
                    user.save((err,user) => {
                    if (err) res.json({error: err.message});
                    res.json({Success: "User successfully updated."})
                    })
                });
                } else {
                user.save((err,user) => {
                    if (err) res.json({error: err.message});
                    res.json({Success: "User successfully updated."})
                })
                }
            }
            }
        })
        })

    app.route('/logout')
        // Logout
        .get((req,res) => {
        if (req.user) console.log("Logging out: " + req.user.username);
        req.logout();
        res.redirect('/');
        });


    app.route('/main')
        // Get and render the main view:
        .get(ensureAuthenticated, (req,res) => {
        res.render(process.cwd() + '/views/main.hbs', {
            showWelcome: true,
            user: req.user,
            admin: req.user.roles.includes('admin')
        });
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

    app.route('/admin')

        // Get the full admin view
        .get(ensureAuthenticated, ensureAdmin, (req,res) => {
        let options = {
            admin: req.user.roles.includes('admin'),
            feedback: req.query.feedback? req.query.feedback : ''
        };
        
        // Grab list of quizzes and users:
        db.models.Quiz.find({}, 'name', (err,quizzes) => {
            if (err) {
            res.json({error: err.message});
            } else {
            options.quizzes = quizzes
            db.models.User.find({}, (err,users) => {
                if (err) {
                res.json({error: err.message});
                } else {
                options.users = users;
                res.render(process.cwd() + '/views/admin.hbs', options);
                }
            })
            }
        })
        })

        // Post a new quiz  
        .post(ensureAuthenticated, ensureAdmin, (req,res) => {
        
        let quizName = req.body.quizName;
        db.models.Quiz.create({ name: quizName }, (err, doc) => {
            if (err) {
            res.json({error: err.message});
            } else {
            res.json(doc);
            }
        });
        })
    
    app.route('/admin/getUserUpdateForm')
        .get(ensureAuthenticated,ensureAdmin, (req,res) => {
        let userId = req.query.userId;
        db.models.User.findOne({_id: userId}, 'username firstname surname',(err,user) => {
            if (err) {
            res.json({error: err.message});
            } else {
            res.render(process.cwd() + '/views/partials/userUpdateForm.hbs', user);
            }
        })
        })

    // Grab list of quizzes for selectQuiz partial
    app.route('/admin/quizzes')
        .get(ensureAuthenticated, (req,res) => {
        let options = {
            admin: req.user.roles.includes('admin')
        };
        
        db.models.Quiz.find({}, 'name', (err,doc) => {
            if (err) {
            res.json({error: err.message});
            } else {
            options.quizzes = doc
            res.render(process.cwd() + '/views/partials/selectQuiz.hbs', options);
            }
        })
        })

    app.route('/quizAdmin/:quizId')

        // Get entire quizAdmin view for a quiz
        .get(ensureAuthenticated, ensureAdmin, (req,res) => {
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
        ensureAdmin, 
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
            res.json({response: err.message});
            } else {
            res.json({response: 'Successfully removed quiz.'});
            }
        });
        
        })
        
        .put(ensureAuthenticated, ensureAdmin, (req,res) => {
        db.models.Quiz.findOne({_id: req.params.quizId}, (err,quiz) => {
            if (err) {
            res.json({response: err.message});
            } else {
            quiz.description = req.body.quizDescription;
            quiz.timeLimit = req.body.quizTimeLimit;
            quiz.maxAttempts = req.body.quizMaxAttempts;
            quiz.save(err => {
                if (err) {
                res.json({response: err.message});
                } else {
                res.json({response: 'Successfully updated quiz.'});
                } 
            })
            }
        })
        })

    app.route('/quizAdmin/:quizId/questions')
        
        // Grab list of questions for questionList partial
        .get(ensureAuthenticated, ensureAdmin, (req,res) => {
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
        .get(ensureAuthenticated, ensureAdmin, (req,res) => {
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
        .delete(ensureAuthenticated, ensureAdmin, (req,res) => {
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

    app.route('/profile')
        // Get and render the whole profile view  
        .get(ensureAuthenticated, (req,res) => {
        
        let context = req.user;
        context.admin = req.user.roles.includes('admin');
        
        // Create object with arrays of scores, one for each quizName
        let scoreArrays = {};
        req.user.quizzes.forEach(quiz => {
            if (! scoreArrays[quiz.quizName]) scoreArrays[quiz.quizName] = [];
            scoreArrays[quiz.quizName].push({ score: quiz.score, date: quiz.date});
        });

        context.scoreArrays = JSON.stringify(scoreArrays);

        // Get the quiz name and add to the context
        res.render(process.cwd() + '/views/profile.hbs', context);
        })

        app.route('/quizReact')

        // Get and render the whole quiz view:
        .get(ensureAuthenticated, (req,res) => {
    
        let options = {
            admin: req.user.roles.includes('admin'),
            showAnswers: showAnswers
        }
    
        if (req.query.quizId) {
    
            if (req.query.mode == "review" && allowTestReviews) {
    
            } else {
                db.models.Quiz.findOne({_id: quizId}, (err,quiz) => {
                    if (err) {
                    res.json({error: err.message});
                    } else {
                    res.json(quiz);
                    }
                });
            } 
            
        } else {
    
            db.models.Quiz.find({}, (err,doc) => {
            if (err) {
                res.json({error: err.message});
            } else {
                options.quizzes = doc;
                res.render(process.cwd() + '/views/quizReact.hbs', options);
            }
            })
        }
        })
    
    // Grab list of quizzes
    app.route('/quizReact/quizzes')
        .get(ensureAuthenticated, (req,res) => {
            db.models.Quiz.find({}, 'name', (err,quizzes) => {
                if (err) {
                    res.json({error: err.message});
                } else {
                    res.json(quizzes);
                }
            })
        })

}