/*
* Norton 2021 - quiZap
*
*/

'use strict';

var expect             = require('chai').expect;
var bcrypt             = require('bcrypt');
var passport           = require('passport');

module.exports = function (app, db) {

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
            welcomeMessage: "Welcome to quiZap!",
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

                if (req.body.roles) {
                    user.roles = req.body.roles;
                }
 
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
            if (req.user) {
                console.log("Logging out: " + req.user.username);
                res.clearCookie(req.user.id);
            }
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



    app.route('/admin')

        // Get the full admin view
        .get(ensureAuthenticated, ensureAdmin, (req,res) => {
            let options = {
                admin: req.user.roles.includes('admin'),
                feedback: req.query.feedback? req.query.feedback : ''
            };
            
            // Grab list of courses and users:
            db.models.Course.find({}, 'name', (err,courses) => {
                if (err) {
                res.json({error: err.message});
                } else {
                options.courses = courses
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

        // Post a new course  
        .post(ensureAuthenticated, ensureAdmin, (req,res) => {
        
            let courseName = req.body.courseName;
            db.models.Course.create({ name: courseName }, (err, doc) => {
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
            db.models.User.findOne({_id: userId}, 'username firstname surname roles',(err,user) => {
                if (err) {
                res.json({error: err.message});
                } else {
                user.admin = req.user.roles.includes('admin');
                res.render(process.cwd() + '/views/partials/userUpdateForm.hbs', user);
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

    app.route('/courses')
        .get(ensureAuthenticated, (req,res) => {
            let options = {
                admin: req.user.roles.includes('admin')
            };
            
            db.models.Course.find({}, 'name', (err,doc) => {
                if (err) {
                res.json({error: err.message});
                } else {
                options.courses = doc
                res.render(process.cwd() + '/views/partials/selectCourse.hbs', options);
                }
            })
        })


    app.route('/courseAdmin')

        // Post a new quiz  
        .post(ensureAuthenticated, ensureAdmin, (req,res) => {
    
            let courseId = req.body.courseId;
            let quizName = req.body.quizName;
            db.models.Quiz.create({ name: quizName,  }, (err, quiz) => {
                if (err) {
                    res.json({error: err.message});
                } else {

                    // Link the new quizId to the mother courseId
                    db.models.Course.findOne({_id: courseId}, (err,course) => {
                        course.quizIds = [...course.quizIds, quiz.id]
                        course.save(err => {
                            if (err) {
                                res.json({error: err.message});
                            } else {
                                res.json(quiz);
                            }
                        })
                    })
                }
            });
        })

    app.route('/courseAdmin/:courseId')

        // Get the full courseAdmin view
        .get(ensureAuthenticated, ensureAdmin, (req,res) => {
            let options = {
                admin: req.user.roles.includes('admin'),
                feedback: req.query.feedback? req.query.feedback : ''
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
                            res.render(process.cwd() + '/views/courseAdmin.hbs', options);
                        }
                    })
                }
            })
        })
        
        .delete(ensureAuthenticated, ensureAdmin, (req,res) => {
            let courseId = req.params.courseId;
            db.models.Course.remove({_id: courseId}, (err) => {
                if (err) {
                res.json({error: err.message});
                } else {
                res.json({response: 'Successfully removed course.'});
                }
            });
        })

    app.route('/courseSelect')

        // Get and render the whole quiz view:
        .get(ensureAuthenticated, (req,res) => {

            let options = { admin: req.user.roles.includes('admin') };

            db.models.Course.find({}, 'name', (err,courses) => {
                if (err) {
                    res.json({error: err.message});
                } else {
                    options.courses = courses;
                    options.userId = req.user._id;
                    res.render(process.cwd() + '/views/courseSelect.hbs', options);
                }
            })
        })        


}