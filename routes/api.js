/*
* Norton 2021
*
*/

'use strict';

var expect            = require('chai').expect;
var bcrypt            = require('bcrypt');
var passport          = require('passport');

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
    .post(passport.authenticate('local', { successRedirect: '/main', failureRedirect: '/?failedLogin=true' }))

  app.route('/register')
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
    .get((req,res) => {

      alertText = "";
      if (req.user) console.log("Logging out: " + req.user.username);
      req.logout();
      res.redirect('/');
    });

  app.route('/main')
    .get(ensureAuthenticated, (req,res) => {
      res.render(process.cwd() + '/views/main.hbs', {
        showWelcome: true,
        username: req.user.username,
        admin: req.user.roles.includes('admin')
      });
    })

  app.route('/quiz')
    .get(ensureAuthenticated, (req,res) => {

      let options = {
          noQuiz: true,
          quizzes: [],
          admin: req.user.roles.includes('admin')
      }

      // Grab list of quizzes:
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
    
  app.route('/quizAdmin/:quizId')
    .get(ensureAuthenticated, ensureAdmin, (req,res) => {
      let quizId = req.params.quizId;
      let options = {
        admin: req.user.roles.includes('admin'),
      };
      
      // Quiz details
      db.models.Quiz.findOne({_id: quizId}, 'name', (err,quiz) => {
        if (err) {
          res.json({error: err.message});
        } else {
          options.quiz = quiz
          res.render(process.cwd() + '/views/quizAdmin.hbs', options);
        }
      })
    })

    .post(ensureAuthenticated, ensureAdmin, (req,res) => {
      
    })

  app.route('/profile')
    .get(ensureAuthenticated, (req,res) => {
      res.render(process.cwd() + '/views/profile.hbs', {
      });
    })

  app.route('/api/quizzes')
    // Provide a list of quizzes
    .get((req,res) => {
      db.models.Quiz.find({}, 'name', (err,doc) => {
        if (err) {
          res.json({error: err.message});
        } else res.json(doc);
      })
    })

};
