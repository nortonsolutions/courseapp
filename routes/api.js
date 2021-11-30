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

    const getScoreArrays = (quizzes, callback) => {

        var courseNameLookup = {};
        db.models.Course.find({}, (err,courses) => {
            Array.from(courses).forEach(course => {
                courseNameLookup[course.id] = course.name;
            })

            let scoreArrays = {};
            quizzes.forEach(quiz => {
                let courseName = courseNameLookup[quiz.courseId];
                if (! scoreArrays[courseName]) scoreArrays[courseName] = {};
                if (! scoreArrays[courseName].quizzes) scoreArrays[courseName].quizzes = [];
                scoreArrays[courseName].quizzes.push({ id: quiz.id, quizId: quiz.quizId, name: quiz.quizName, score: quiz.score, timePassed: quiz.timePassed, date: quiz.date});
            });

            Object.keys(scoreArrays).forEach(courseName => {

                scoreArrays[courseName].averageScore = scoreArrays[courseName].quizzes.reduce((acc,cur,index) => {
                    if (index == scoreArrays[courseName].quizzes.length - 1) {
                        return (acc+cur.score) / (index + 1);
                    } else {
                        return acc+cur.score;
                    }
                }, 0)

                scoreArrays[courseName].overallTime = scoreArrays[courseName].quizzes.reduce((acc,cur) => {
                    return acc+cur.timePassed;
                }, 0)

                scoreArrays[courseName].lastQuiz = scoreArrays[courseName].quizzes.reduce((acc,cur) => {
                    if (cur.date > acc) {
                        return cur.date;
                    } else return acc;
                }, 0)
            
            
            })
            callback(scoreArrays);    

        })
    }

    const getProjectsArrays = (projects, callback) => {
        var courseNameLookup = {};
        var quizNameLookup = {};
        db.models.Course.find({}, (err,courses) => {
            Array.from(courses).forEach(course => {
                courseNameLookup[course.id] = course.name;
            })

            db.models.Quiz.find({}, (err, quizzes) => {
                Array.from(quizzes).forEach(quiz => {
                    quizNameLookup[quiz.id] = quiz.name;
                })
                let projectArrays = {};
                projects.forEach(project => {
                    let courseName = courseNameLookup[project.courseId];
                    if (! projectArrays[courseName]) projectArrays[courseName] = {};
                    if (! projectArrays[courseName].projects) projectArrays[courseName].projects = [];

                    projectArrays[courseName].projects.push({ id: project.id, file: project.file, quizId: project.quizId, quizName: quizNameLookup[project.quizId] });
                });

                callback(projectArrays);    
            })
        })        
    }

    app.route('/profile')
        .get(ensureAuthenticated, (req,res) => {
        
            let context = req.user;
            context.admin = req.user.roles.includes('admin');
            context.teacher = req.user.roles.includes('teacher');
            getScoreArrays(context.quizzes, (scoreArrays) => {
                getProjectsArrays(context.projects, (projectArrays) => {
                    context.public = false;
                    context.projectArrays = projectArrays;
                    context.scoreArraysObj = scoreArrays;
                    context.scoreArrays = JSON.stringify(scoreArrays);
    
                    if (context.teacher) {
    
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
                
                
            });
        })

    app.route('/publicProfile/:username')
        .get((req,res) => {
            db.models.User.findOne({'username': req.params.username}, (err,context) => {
                if (err) {
                    res.json({error: err.message});
                } else {
                    context.public = true;
                    context.teacher = context.roles.includes('teacher');
                    getScoreArrays(context.quizzes, (scoreArrays) => {
                        getProjectsArrays(context.projects, (projectArrays) => {
                            context.projectArrays = projectArrays;
                            context.scoreArraysObj = scoreArrays;
                            context.scoreArrays = JSON.stringify(scoreArrays);
                            
                            if (context.teacher) {
            
                                db.models.Course.find({ 'instructors.instructorId': context.id }).select('name').sort({ name: 1}).exec((err,courses) => {
                                    if (err) {
                                        res.json({error: err.message});
                                    } else {
                                        context.myCourses = courses;
                                        res.render(process.cwd() + '/views/publicProfile.hbs', context);
                                    }
                                })
                
                            } else {
                                res.render(process.cwd() + '/views/publicProfile.hbs', context);
                            }
                        });
                    });
                }
            })
        })

    app.route('/public/tryfont')
        .get((req,res) => {
            let context = {
                font: req.query.font
            }
            res.render(process.cwd() + '/views/tryfont.hbs', context);
        })
}