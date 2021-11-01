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
  type: 'multi',
  question: '',
  choices: [
      { text: '', correct: false},
      { text: '', correct: false},
      { text: '', correct: false},
      { text: '', correct: false}
  ]
}

module.exports = function (app, db) {

  var alertText = "";

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
        showRegistration: true,
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
                { username: req.body.username, password: hash },
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

  app.route('/logout')
    // Logout
    .get((req,res) => {
      alertText = "";
      if (req.user) console.log("Logging out: " + req.user.username);
      req.logout();
      res.redirect('/');
    });


  app.route('/main')
    // Get and render the main view:
    .get(ensureAuthenticated, (req,res) => {
      res.render(process.cwd() + '/views/main.hbs', {
        showWelcome: true,
        username: req.user.username,
        admin: req.user.roles.includes('admin')
      });
    })


  app.route('/quiz')

  // Get and render the whole quiz view:
  .get(ensureAuthenticated, (req,res) => {

      let options = {
          noQuiz: true,
          quizzes: [],
          admin: req.user.roles.includes('admin')
      }

      db.models.Quiz.find({}, 'name', (err,doc) => {
        if (err) {
          res.json({error: err.message});
        } else {
          options.quizzes = doc;
          res.render(process.cwd() + '/views/quiz.hbs', options);
        }
      })
    })



  app.route('/admin')

    // Get the full admin view
    .get(ensureAuthenticated, ensureAdmin, (req,res) => {
      let options = {
        admin: req.user.roles.includes('admin'),
        feedback: req.query.feedback? req.query.feedback : ''
      };
      
      // Grab list of quizzes:
      db.models.Quiz.find({}, 'name', (err,doc) => {
        if (err) {
          res.json({error: err.message});
        } else {
          options.quizzes = doc
          res.render(process.cwd() + '/views/admin.hbs', options);
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

    // Grab list of quizzes for selectQuiz partial
    app.route('/admin/quizzes')
    .get(ensureAuthenticated, (req,res) => {
      let options = {
        admin: req.user.roles.includes('admin'),
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

      db.models.Quiz.findOne({_id: quizId}, 'name questions', (err,quiz) => {
        if (err) {
          res.json({error: err.message});
        } else {
          options.quiz = quiz
          res.render(process.cwd() + '/views/quizAdmin.hbs', options);
        }
      })
    })

    // Post question for the quiz
    .post(ensureAuthenticated, ensureAdmin, (req,res) => {
      let quizId = req.params.quizId;
      let question = req.body.question;
      db.models.Quiz.findOne({_id: quizId}, (err,doc) => {
        
        if (question._id == 0) {
          // add new question
          doc.questions = [...doc.questions, { 
            question: question.question, 
            choices: question.choices,
            type: question.type
          }];

        } else {
          // update existing question
          var subDoc = doc.questions.id(question._id);
          subDoc.question = question.question;
          subDoc.choices = question.choices;
          subDoc.type = question.type;
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

  app.route('/profile')
    // Get and render the whole profile view  
    .get(ensureAuthenticated, (req,res) => {
      res.render(process.cwd() + '/views/profile.hbs', {
      });
    })

};
