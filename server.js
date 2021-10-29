/**
 * Norton 2021 - nortonQuiz App
 */

'use strict';

var express     = require('express');
var session     = require('express-session');
var bodyParser  = require('body-parser');
var cors        = require('cors');

var auth              = require('./auth.js');
var apiRoutes         = require('./routes/api.js');
var helmet            = require('helmet');
var passport          = require('passport');
var hbs               = require('express-hbs');


// For unit and functional testing with Chai later:
// var expect            = require('chai').expect;
// var fccTestingRoutes  = require('./routes/fcctesting.js');
// var runner            = require('./test-runner');

var app = express();

app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials'
}));

app.set("view engine", "hbs");
app.set('views', __dirname + '/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

//For FCC testing purposes
// fccTestingRoutes(app);

auth(app);
//Routing for API 

// ensureAuthenticated
const ensureAuthenticated = (req,res,next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

app.route('/')
  .get((req,res) => {
    res.render(process.cwd() + '/views/index.hbs', {
      welcomeMessage: "Welcome to QuizApp!",
      showRegistration: true,
      showLogin: true
    });
  })

app.route('/login')
  .post(passport.authenticate('local', { 
    failureRedirect: '/'
  }), (req, res) => {
    res.redirect('/main');
  })


app.route('/register')
  .post((req,res) => {

  })

app.route('/logout')
  .get((req,res) => {

    if (req.user) console.log("Logging out: " + req.user.username);
    req.logout();
    res.redirect('/');
  });

app.route('/main')
  .get(ensureAuthenticated, (req,res) => {

  })

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        // runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
