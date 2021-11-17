// const replySchema = mongoose.Schema({
//     text: { type: String, required: true },
//     created_on: Date,
//     author: { type: String, required: true },
//     reported: { type: Boolean, default: false }
//   })

// const threadSchema = mongoose.Schema({
//     courseId: { type: String, required: true }, 
//     text: { type: String, required: true },
//     created_on: Date,
//     bumped_on: Date,
//     status: String,
//     author: { type: String, required: true },
//     reported: { type: Boolean, default: false },
//     replies: {type: [replySchema], default: []}
//   })

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

module.exports = function(app,db) {

  app.route('/api/threads/:courseId')
    .post(ensureAuthenticated, (req,res) => {

      let courseId = req.params.courseId;
      let text = req.body.text;
      let date = new Date();

        let newThread = {
          courseId: courseId,
          text: text,
          created_on: date,
          bumped_on: date,
          reported: false,
          author: req.user.firstname + ' ' + req.user.surname,
          replies: []
        }

        db.models.Thread.create(newThread, (err,thread) => {

          if (err) {
            res.send(err.message);
          } else {
            res.send(thread);
            // res.redirect(302, '/b/' + board + '/');
          }
        })
          
      })

    .get(ensureAuthenticated, (req,res) => {
      let courseId = req.params.courseId;

      db.models.Thread.find({courseId: courseId}).limit(10).sort({ bumped_on: -1 }).select('-reported').exec((err, threads) => {
        if (err) {
          res.send(err.message);
        } else {
          threads.forEach(thread => {
            thread.replies = thread.replies.sort((a,b) => {
              return (a.created_on < b.created_on);
            }).slice(0,3);
          })
          res.json(threads);
        }
      })
    })

    .delete(ensureAuthenticated, ensureAdmin, (req,res) => {
      let courseId = req.params.courseId;
      let threadId = req.body.threadId;

      db.models.Thread.findOne({ _id: threadId }, (err,thread) => {
          if (err) {
            res.send(err.message);
          } else {
              thread.remove((err) => {
                  res.send('successfully deleted thread');
              })
          }
        })
      })

      .put(ensureAuthenticated, (req,res) => {
        
        let thread_id = req.body.report_id;
        ThreadModel.findOne({ _id: thread_id }, (err,thread) => {
          if (err) {
            res.send(err.message);
          } else {
            thread.reported = true;
            thread.save(err => {
              if (err) {
                res.send(err.message);
              } else {
                res.send('thread has been reported');
              }
            })
          }
        })
      })


  app.route('/api/replies/:courseId')
      .post(ensureAuthenticated, (req,res) => {

      let courseId = req.params.courseId;
      let text = req.body.text;
      let threadId = req.body.threadId;
      
      db.models.Thread.findOne({_id: threadId}, (err,thread) => {

        if (err) {
          res.send(err.message);
        } else {
            let date = new Date();
            thread.bumped_on = date;
            thread.replies = [...thread.replies, new ReplyModel({
              text: text,
              author: req.user.firstname + ' ' + req.user.surname,
              created_on: date
            })];
            thread.save((err,thread) => {
              if (err) {
                res.send(err.message);
              } else {
                
                res.send(thread);
                // res.redirect(302, '/b/' + courseId + "/" + thread_id);
              }
            })
          
        }
      })
    })

    .get(ensureAuthenticated, (req,res) => {
        let courseId = req.params.courseId;
        let threadId = req.query.threadId;

        db.models.Thread.findOne({courseId: courseId, _id: threadId}).select('-reported').exec((err, thread) => {
          if (err) {
            res.send(err.message);
          } else {
            res.json(thread);
          }
        })

    })

    .delete(ensureAuthenticated, ensureAdmin, (req,res) => {
      let threadId = req.body.threadId;
      let replyId = req.body.replyId;
      

      db.models.Thread.findOne({ _id: threadId }, (err,thread) => {
        if (err) {
          res.send(err.message);
        } else {
          let replyIndex = thread.replies.findIndex(el => {
              return el._id == replyId;
          });
          thread.replies[replyIndex].text = '[deleted]';
          thread.save(err => {
            res.send(err? err.message: 'success');
          })
        }
      })
    })

    .put((req,res) => {

        let threadId = req.body.threadId;
        let replyId = req.body.replyId;
        db.models.Thread.findOne({ _id: threadId }, (err,thread) => {
          if (err) {
            res.send(err.message);
          } else {

            let replyIndex = thread.replies.findIndex(el => {
              return el._id == replyId;
            });

            thread.replies[replyIndex].reported = true;
            thread.save(err => {
                res.send(err? err.message: 'success');
            })
          }
        })

    })

}