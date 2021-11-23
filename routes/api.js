/*
* Norton 2021 - CourseApp
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

    // ensureAdmin
    const ensureAdmin = (req,res,next) => {
        if (req.user.roles.includes('admin')) {
            next();
        } else {
            res.redirect('/main');
        }     
    };

    app.route('/')
        // Get and render the index view
        .get((req,res) => {
        
        
        let options = {
            welcomeMessage: "Welcome to CourseApp!",
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
            db.models.User.find({}).select('username firstname surname').sort({ surname: 1 }).exec((err,users) => {
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
                            res.json(err? {error: err.message} : {success: "User updated."});
                        })
                    });
                } else {
                    user.save((err,user) => {
                        res.json(err? {error: err.message} : {success: "User updated."});
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
            db.models.Course.find({}).select('name').sort({name: 1}).exec((err,courses) => {
                if (err) {
                res.json({error: err.message});
                } else {
                options.courses = courses
                db.models.User.find({}).sort({surname: 1}).exec((err,users) => {
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
                res.json(err? {error: err.message} : doc);
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
            context.teacher = req.user.roles.includes('teacher');

            // Create a courseName lookup object
            var courseNameLookup = {};
            db.models.Course.find({}, (err,courses) => {
                Array.from(courses).forEach(course => {
                    courseNameLookup[course.id] = course.name;
                })

                // Create object with arrays of scores, one for each courseName
                let scoreArrays = {};
                req.user.quizzes.forEach(quiz => {
                    let courseName = courseNameLookup[quiz.courseId];
                    if (! scoreArrays[courseName]) scoreArrays[courseName] = [];
                    scoreArrays[courseName].push({ name: quiz.quizName, score: quiz.score, date: quiz.date});
                });

                context.scoreArrays = JSON.stringify(scoreArrays);

                if (context.teacher) {

                    // let idTest = RegExp(req.user.id);
                    // Get the courses for which he is an instructor

                    db.models.Course.find({ 'instructors.instructorId': req.user.id }).select('name').sort({ name: 1}).exec((err,courses) => {
                        if (err) {
                            res.json({error: err.message});
                        } else {
                            context.myCourses = courses;
                            res.render(process.cwd() + '/views/profile.hbs', context);
                        }
                    })

                } else {
                    res.render(process.cwd() + '/views/profile.hbs', context);
                }
            })
        })

}