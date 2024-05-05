var express = require('express');
var router = express.Router();
/*
// localhost:3000/users/
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
*/

// new stuff
var path = require('path');
var env = require('dotenv').config();
// Connect to process.env.DATABASE_URL when your app initializes:
// Read only reference value (const)
// get only Client class from pg package
const Client = require('pg').Client;

// create an instance from Client
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

// connect to the DATABASE_URL
client.connect();

var passport = require('passport');
var bcrypt = require('bcryptjs');

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) {
      console.log("unable to logout:", err);
      return next(err);
    }
  });   //passport provide it
  res.redirect('/'); // Successful. redirect to localhost:3000/
});



function loggedIn(req, res, next) {
  if (req.user) {
    next(); // req.user exists, go to the next function (right after loggedIn)
  } else {
    res.redirect('/users/login'); // user doesn't exists redirect to localhost:3000/users/login
  }
}

router.get('/profile',loggedIn, function(req, res){
  // req.user: passport middleware adds "user" object to HTTP req object
  res.sendFile(path.join(__dirname,'..', 'public','profile.html'));
});


router.get('/recipe',loggedIn, function(req, res){
  // req.user: passport middleware adds "user" object to HTTP req object
  res.sendFile(path.join(__dirname,'..', 'public','recipe.html'));
});

router.get('/about',loggedIn, function(req, res){
  // req.user: passport middleware adds "user" object to HTTP req object
  res.sendFile(path.join(__dirname,'..', 'public','about.html'));
});

function notLoggedIn(req, res, next) {
  if (!req.user) {
    next();
  } else {
    let prefer = req.user.prefer;
    res.redirect('/users/profile?name='+prefer);
  }
}

// localhost:3000/users/login
router.get('/login', notLoggedIn, function(req, res){
  //success is set true in sign up page
  res.sendFile(path.join(__dirname,'..', 'public','login.html'));
});

// localhost:3000/users/login
router.post('/login',
  // This is where authentication happens - app.js
  // authentication locally (not using passport-google, passport-twitter, passport-github...)
  passport.authenticate('local', { failureRedirect: 'login?message=Incorrect+credentials', failureFlash:true }),
  function(req, res,next) {
    let prefer = req.user.prefer;
    console.log("fullname: ", prefer);
    res.redirect('/users/profile?name='+prefer); // Successful. redirect to localhost:3000/users/profile
});


router.get('/signup',function(req, res) {
  // If logged in, go to profile page
  if(req.user) {
    let prefer = req.user.prefer;
    return res.redirect('/users/profile?name='+prefer);
  }
  res.sendFile(path.join(__dirname,'..', 'public','signup.html'));
});

function createUser(req, res, next){
  var salt = bcrypt.genSaltSync(10);
  var password = bcrypt.hashSync(req.body.password, salt);

  client.query('INSERT INTO users (username, password, fullname, prefer) VALUES($1, $2, $3, $4)', [req.body.username, password,req.body.fullname,req.body.prefer], function(err, result) {
    if (err) {
      console.log("unable to query INSERT");
      return next(err); // throw error to error.hbs.
    }
    console.log("User creation is successful");
    res.redirect('/users/login?message=We+created+your+account+successfully!');
  });
}

router.post('/signup', function(req, res, next) {
  client.query('SELECT * FROM users WHERE username=$1',[req.body.username], function(err,result){
    if (err) {
      console.log("sql error ");
      next(err); // throw error to error.hbs.
    }
    else if (result.rows.length > 0) {
      console.log("user exists");
      res.redirect('/users/signup?error=User+exists');
    }
    else {
      console.log("no user with that name");
      createUser(req, res, next);
    }
  });
});
// new stuff ends here

module.exports = router;