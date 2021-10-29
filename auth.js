
const LocalStrategy = require('passport-local');
const bcrypt        = require('bcrypt');
const passport      = require('passport');
const mongoose      = require('mongoose');

module.exports = function (app) {

  const userSchema = mongoose.Schema({

    username: { type: String, required: true },
    password: { type: String, required: true },
    roles: [String]

  })

  const UserModel = mongoose.model('User', userSchema);

  const CONNECTION_STRING = process.env.DB;
  mongoose.connect(CONNECTION_STRING, { useMongoClient: true })
    .then(
      
      () => {
        passport.serializeUser((user, done) => {
          done(null, user._id);
        });
        
        passport.deserializeUser((id, done) => {
            UserModel.findOne({_id: id}, (err, doc) => {
              done(null, doc);
            });
        });
      
        passport.use(new LocalStrategy(
          function(username, password, done) {
            UserModel.findOne({ username: username }, function (err, user) {
              console.log('User '+ username +' attempted to log in.');
              if (err) { return done(err); }
              if (!user) { return done(null, false); }
              
              bcrypt.compare(password, user.password).then(success => {
                if (!success) {
                  return (null, false);
                } else return done(null, user);
              });
            });
          }
        ));
      },

      (err) => {
          console.log('Database error: ' + err.message);
    }
  )
}