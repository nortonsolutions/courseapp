'use strict';


module.exports = function (app, db) {

    // ensureAuthenticated
    const ensureAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    };


    // ensureAdminOrTeacher
    const ensureAdminOrTeacher = (req, res, next) => {
        let courseId = req.params.courseId;

        db.models.User.findOne({ username: req.user.username }, 'username roles', (err, user) => {
            if (user.roles.includes('admin')) {
                next();
            } else {
                if (user.roles.includes('teacher')) {
                    db.models.Course.findOne()
                        .and([{ _id: courseId }, { 'instructors.instructorId': req.user.id }])
                        .exec((err, course) => {
                            if (course) next();
                        })

                } else {
                    res.redirect('/main');
                }
            }
        })
    };




}
