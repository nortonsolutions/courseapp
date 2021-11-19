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

    // ensureAdmin
    const ensureAdmin = (req,res,next) => {
        db.models.User.findOne({ username: req.user.username }, 'username roles', (err, user) => {
        if (user.roles.includes('admin')) {
            next();
        } else {
            res.redirect('/main');
        }     
        })
    };

    // ensureAdminOrTeacher
    const ensureAdminOrTeacher = (req,res,next) => {
        let courseId = req.params.courseId;
        
        db.models.User.findOne({ username: req.user.username }, 'username roles', (err, user) => {
        if (user.roles.includes('admin')) {
            next();
        } else {
            if (user.roles.includes('teacher')) {
                db.models.Course.findOne()
                .and([{_id: courseId}, {'instructors.instructorId': req.user.id}])
                .exec((err,course) => {
                    if (course) next();
                })

            } else {
                res.redirect('/main');
            }
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



            // Create object with arrays of scores, one for each quizName
            let scoreArrays = {};
            req.user.quizzes.forEach(quiz => {
                if (! scoreArrays[quiz.quizName]) scoreArrays[quiz.quizName] = [];
                scoreArrays[quiz.quizName].push({ score: quiz.score, date: quiz.date});
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

    app.route('/courses')
        .get(ensureAuthenticated, (req,res) => {
            let options = {
                admin: req.user.roles.includes('admin')
            };

            db.models.Course.find({}).select('name').sort({ name: 1 }).exec((err,doc) => {
                if (err) {
                res.json({error: err.message});
                } else {
                options.courses = doc
                res.render(process.cwd() + '/views/partials/selectCourse.hbs', options);
                }
            })
        })

    app.route('/course/:courseId')

        .get(ensureAuthenticated, (req,res) => {


            let options = { admin: req.user.roles.includes('admin') };
            let courseId = req.params.courseId;

            db.models.Course.findOne({ _id : courseId}, (err, course) => {
                if (err) {
                    res.json({error: err.message});
                } else {
                    options.course = course;
                    db.models.Quiz.find()
                    .where('_id').in(course.quizIds.map(el => el.quizId))
                    .select('name').exec((err, quizzes) => {
                        if (err) {
                            res.json({error: err.message});
                        } else {

                            // Sort quizzes according to course quizIds sortKey
                            var sortLookupTable = {}
                            Array.from(course.quizIds).forEach(el => {
                                sortLookupTable[el.quizId] = el.sortKey;
                            })
                            
                            options.quizzes = Array.from(quizzes).sort((a,b) => {
                                return sortLookupTable[a.id] - sortLookupTable[b.id]
                            });

                            options.userId = req.user._id;

                            // Add messageboard threads to options
                            db.models.Thread.find({courseId: courseId}, (err,threads) => {
                                options.threads = threads;
                                res.render(process.cwd() + '/views/course.hbs', options);
                            })
                        }
                    })
                }
            })
        })

    app.route('/course/messageBoard/:courseId')

        .get(ensureAuthenticated, (req,res) => {

            let options = { admin: req.user.roles.includes('admin') };
            var courseId = req.params.courseId;
                
                db.models.Thread.find({courseId: courseId}).limit(10).sort({ bumped_on: -1 }).exec((err, threads) => {
                    
                    threads.forEach(thread => {
                        thread.replies = thread.replies.sort((a,b) => {
                        return (a.created_on < b.created_on);
                        }).slice(0,3);
                    })
                    options.threads = threads;
                    res.render(process.cwd() + '/views/partials/messageBoard.hbs', options);
                })
            })
    

    app.route('/courseAdmin')

        // Delete the given course
        .delete(ensureAuthenticated, ensureAdmin, (req,res) => {
            let courseId = req.body.courseId;
            db.models.Course.remove({_id: courseId}, (err) => {
                res.json(err? {error: err.message} : {success: "Course removed."});
            });
        })

    app.route('/courseAdmin/:courseId')

        // Get the full courseAdmin view
        .get(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
            let options = {
                admin: req.user.roles.includes('admin'),
                feedback: req.query.feedback? req.query.feedback : ''
            };
            
            db.models.Course.findOne({ _id : req.params.courseId}, (err, course) => {
                if (err) {
                    res.json({error: err.message});
                } else {
                    options.course = course;

                    db.models.Quiz.find()
                    .where('_id').in(course.quizIds.map(el => el.quizId))
                    .select('name').exec((err, quizzes) => {
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

                            options.quizzesHighIndex = quizzes.length - 1;
                            options.teachers = [];

                            // Also get the Users marked with teacher role
                            db.models.User.find((err, users) => {
                                users.forEach(user => {
                                    if (user.roles.includes('teacher')) {
                                        options.teachers = [...options.teachers, user]
                                    }
                                })
                                res.render(process.cwd() + '/views/courseAdmin.hbs', options);
                            })
                        }
                    })
                }
            })
        })

        // Post a new quiz for the given course
        .post(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
    
            let courseId = req.params.courseId;
            let quizName = req.body.quizName;
            db.models.Quiz.create({ name: quizName }, (err, quiz) => {
                if (err) {
                    res.json({error: err.message});
                } else {

                    // Link the new quizId to the mother courseId
                    db.models.Course.findOne({_id: courseId}, (err,course) => {
                        
                        // TODO: Determine the highest sortKey
                        let highestSortKey = course.quizIds.reduce((acc,cur) => {
                            if (cur.sortKey > acc) {
                                return cur.sortKey;
                            } else return acc;
                        },0);

                        let newQuizId = {
                            quizId: quiz._id,
                            sortKey: highestSortKey + 1
                        }

                        course.quizIds = [...course.quizIds, newQuizId];
                        course.save(err => {
                            res.json(err? {error: err.message} : quiz);
                        })
                    })
                }
            });
        })

        // Post details for the course (description, content, instructors, etc.)
        .put(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
            let courseId = req.params.courseId;
            
            // instructorID will always be sent by itself, one at a time
            if (req.body.instructorId) {

                let instructorId = req.body.instructorId;
                db.models.Course.findOne({ _id : courseId}, (err, course) => {
                    if (err) {
                        res.json({error: err.message});
                    } else {

                        if (course.instructors.filter(el => el.instructorId == instructorId).length == 0) {
                            
                            db.models.User.findOne({ _id: instructorId }, 'surname firstname', (err,user) => {
                                
                                course.instructors = [...course.instructors, { 
                                    instructorId: instructorId,
                                    instructorName: user.surname + ', ' + user.firstname
                                }];
                                course.save(err => {
                                    let options = { course: course };
                                    res.render(process.cwd() + '/views/partials/instructors.hbs', options);
                                })
                            })

                        } else {
                            res.json({success: "Instructor already exists."});
                        }
                    }
                })

            // Handle module (aka 'quiz') sort change
            } else if (req.body.changeSort) {

                let quizId = req.body.quizId;
                let changeSort = req.body.changeSort;

                db.models.Course.findOne({ _id : courseId})
                    .select('quizIds')
                    .exec((err, course) => {

                        // Re-sort to match display just in case data was imported
                        course.quizIds = Array.from(course.quizIds).sort((a,b) => {
                            return a.sortKey - b.sortKey;
                        });

                        let quizIndex = course.quizIds.findIndex(e => e.quizId == quizId);
                        let indexToSwap = changeSort=="up"? quizIndex - 1 : quizIndex + 1;
                        let swapSortKey = course.quizIds[indexToSwap].sortKey;
                        course.quizIds[indexToSwap].sortKey = course.quizIds[quizIndex].sortKey;
                        course.quizIds[quizIndex].sortKey = swapSortKey;
                        course.save(err => {
                            res.json(err? {error: err.message} : {});
                        })
                    }
                );

            // Handle other details (description, homeContent....)
            } else {

                db.models.Course.findOne({ _id : courseId}, (err, course) => {
                    if (err) {
                        res.json({error: err.message});
                    } else {
                        course.description = req.body.description;
                        course.homeContent = req.body.homeContent;
                        course.save(err => {
                            res.json(err? {error: err.message} : {success: "Course updated."});
                        })
                    }   
                });
            }
        })

        // Delete an instructor for this course
        .delete(ensureAuthenticated, ensureAdmin, (req,res) => {
            
            let courseId = req.params.courseId;
            let instructorId = req.body.instructorId;

            db.models.Course.findOne({_id: courseId}, (err,course) => {
                if (err) {
                    res.json({error: err.message});
                } else {

                    course.instructors = course.instructors.filter(el => el.instructorId != instructorId);
                    course.save(err => {
                        if (err) {
                            res.json({error: err.message});
                        } else {
                            let options = { course: course };
                            res.render(process.cwd() + '/views/partials/instructors.hbs', options);
                        }
                    })
                }
            });
        })

    app.route('/courseAdmin/:courseId/modalModules')
        .get(ensureAuthenticated, ensureAdminOrTeacher, (req,res) => {
            let courseId = req.params.courseId;

            let options = {
                admin: req.user.roles.includes('admin'),
                feedback: req.query.feedback? req.query.feedback : ''
            };
            
            db.models.Course.findOne({ _id : courseId})
                .select('quizIds')
                .exec((err, course) => {
                if (err) {
                    res.json({error: err.message});
                } else {
                    db.models.Quiz.find()
                    .where('_id').in(course.quizIds.map(el => el.quizId))
                    .select('name').exec((err, quizzes) => {
                        if (err) {
                            res.json({error: err.message});
                        } else {

                            var sortLookupTable = {}
                            Array.from(course.quizIds).forEach(el => {
                                sortLookupTable[el.quizId] = el.sortKey;
                            })
                            
                            options.quizzes = Array.from(quizzes).sort((a,b) => {
                                return sortLookupTable[a.id] - sortLookupTable[b.id]
                            });

                            options.quizzesHighIndex = quizzes.length - 1;
                            res.render(process.cwd() + '/views/partials/modalModules.hbs', options);
                        }
                    })
                }
            })
        })
    


    app.route('/courseSelect')

        // Get and render the whole quiz view:
        .get(ensureAuthenticated, (req,res) => {

            let options = { admin: req.user.roles.includes('admin') };

            db.models.Course.find({}).select('name').sort({name: 1}).exec((err,courses) => {
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