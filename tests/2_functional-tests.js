/*
* Norton - 2021 - Learning Mocha-Chai-ChaiHTTP-Lodash-Zombie
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var _ = require('lodash');

var server = require('../server');
var Browser = require('zombie');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  // ### EXAMPLE - asyncronous operations ### 
  test('Asynchronous test #example', function(done){
    setTimeout(function(){
      assert.isOk('Async test !!');
      done(); /** Call 'done()' when the async operation is completed**/
    }, 100);
  });

  suite('General API route testing', function() {
    
    test('GET /', (done) => {
      chai.request(server)
        .get('/')
        .end((err,res) => {
          assert.equal(res.status, 200, 'Response status should be 200');
          assert.match(res.text, /Welcome to/, 'GET / should return welcome screen');
          assert.equal(res.type, 'text/html', 'Response should be type "text/html"');
          done();
        })
    });

    test('GET invalid URL',(done) => {
      chai.request(server)
        .get('/asdfsadfa')
        .end((err,res) => {
          assert.equal(res.status, 404, 'Response status should be 404');
          assert.match(res.text, /[nN]ot [Ff]ound/, 'Response should indicate "Not Found"');
          done();
        })
    });

    test('GET /quiz without authentication',(done) => {
      chai.request(server)
        .get('/quiz')
        .end((err,res) => {
          assert.equal(res.status, 200, 'Response status should be 200');
          assert.match(res.text, /Welcome to/, 'GET / should return welcome screen');
          done();
        })
    });

    suite('User creation', function() {

      test('Create new user',(done) => {
        chai.request(server)
          .post('/register')
          .send({username: 'Leassim', firstname: "Leassim", surname: "Hernandez", password: 'emkcuf'})
          .end((req,res) => {
            assert.match(res.redirects[0], /main/, 'Response should include a redirect to /main');
            done();
          })
      });
    });

    suite('Login and Logout', function() {
      test('Login',(done) => {
        chai.request(server)
          .post('/login')
          .send({username: 'dave', password: 'dave'})
          .end((req,res) => {
            assert.match(res.redirects[0], /main/, 'Response should include a redirect to /main');
            done();
          })
      });

      test('Logout',(done) => {
        chai.request(server)
          .get('/logout')
          .end((req,res) => {
            assert.equal(res.status, 200, 'Response status should be 200');
            assert.match(res.text, /Welcome to/, 'GET / should return welcome screen');
            done();
          })
        });
    });
  });

  suite('e2e with Zombie:', () => {
    Browser.site = 'http://localhost:3000'; 

    suite('Login and Logout', function() {

      const browser = new Browser();

      suiteSetup(function(done) {
        return browser.visit('/', done); // Browser asynchronous operations take a callback
      });

      test('Login',(done) => {
        browser
          .fill('username', 'dave')
          .fill('password', 'dave')
          .pressButton('Submit', () => {
            browser.assert.success();
            browser.assert.url(/main/)
            browser.assert.text('p.lead', /Select a Quiz/);
            done();
          })
      });

      test('Access Quiz page',(done) => {
        browser.visit('/quiz', () => {
          browser.assert.success();
          browser.assert.url(/quiz/);
          browser.assert.text('h1', /Main Quiz Interface/);
          done();
        });
      });

      test('Logout',(done) => {
        browser.visit('/logout', () => {
          browser.assert.success();
          browser.assert.text('h2', /Welcome to/);
          done();
        });
      })
    });
  });
});
