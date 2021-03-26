/**
  routing file to handle basic user functions such as login and register
*/

const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const VerifyToken = require("../models/verify.js");
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodemailer = require('nodemailer');
const { findByIdAndUpdate } = require('../models/user.js');
const async = require("async");

//login handle
router.get('/login', (req, res) => {
  res.render('login');
});

//Renders the register page for access
router.get('/register', (req, res) => {
  res.render('register');
});

//The handler for the the registeration of the page
router.post('/register', (req, res) => {

  const { username, email, password, password2 } = req.body; //getting the data from the page
  let errors = []; //array that gathers errors to display to the user


  //making sure all fields are entered
  if (!username || !email || !password || !password2) {
    errors.push({
      msg: "please fill in all fields"
    });
  }

  //checking if passwords match
  if (password !== password2) {
    errors.push({
      msg: "passwords dont match"
    });
  }

  //checking if password length is above 6 characters
  if (password.length < 6) {
    errors.push({
      msg: "password must be at least 6 characters"
    });
  }

  /*
  checking for the found errors
  if errors are found the page will re-render with the same entered info and display errors
  */
  if (errors.length > 0) {
    res.render('register', {
      errors: errors,
      username: username,
      email: email,
      password: password,
      password2: password2
    });


  } else {

    //password validation passed, now below code checks to see if user has already been registered
    //this query below ensures that the username and email entered are unique
    User.find({ $or: [{ email: email }, { username: username }] }).exec((err, user) => {
      if (user.length > 0) {

        //checking which values were found in the database to print the error
        for (var i = 0; i < user.length; i++) {
          if (user[i].username == username) {
            errors.push({ msg: 'Username is taken' });
          }
          if (user[i].email == email) {
            errors.push({ msg: 'Email already registered' });
          }
        }
        res.render('register', {
          errors,
          username,
          email,
          password,
          password2
        });

      } else {

        //creating a new user for the db
        const newUser = new User({
          username: username,
          email: email,
          password: password,
        });

        //making the email verificaiton token with a random hex string
        var genVerifyToken = crypto.randomBytes(20).toString('hex');

        //adding the users verify token to the token DB
        const newVerifyToken = new VerifyToken({
          userID: newUser._id,
          verifyToken: genVerifyToken,
          verifyTokenExpire: Date.now() + 3600000 // 1 hour
        });

        //entering the new token to the collection & logging it to console
        newVerifyToken.save().then((value) => {

        }).catch(value => console.log(value));

        //hashing the users password to insert into the db
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt,
            (err, hash) => {
              if (err) throw err

              //save password to hash
              newUser.password = hash;

              //saving the user to the db and sending a conformation message
              newUser.save()
                .then((value) => {
                  req.flash('success_msg', 'you have now registered, please check your email for a verification link!');
                  req.session.save(function () {
                    res.redirect('/users/login');
                  });
                }).catch(value => console.log(value));

              /*
                sending the verification email to the user
              */

              let smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                  user: 'chubservices@gmail.com',
                  pass: process.env.GMAILPW
                },
                tls: {
                  rejectUnauthorized: false
                }
              });
              //The message being sent to the user
              let mailOptions = {
                to: newUser.email,
                from: 'chubservices@gmail.com',
                subject: 'Content-HUB Account Verification',
                text: 'Welcome to Content-Hub, you are one step away from completing your signup.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/users/verify/' + genVerifyToken + '\n\n' +
                  'If this wasn\'t you please contact chubservices@gmail.com for help.\n'
              };
              //sending the mail
              smtpTransport.sendMail(mailOptions, function(err) {
                console.log('Mail Sent!');
              });

            }));
      }
    });
  }
});

//handler for the user clicking their verification email
router.get('/verify/:token', function(req, res) {

  //finding the verify token in the db
  VerifyToken.findOne({
    verifyToken: req.params.token
  }).populate('userID').exec(function(err, verify) { //this function checks that the token was found and if not redirects to the login page
    if (!verify) {
      req.flash('error', 'verify token invalid');
      return res.redirect('/users/login');
    }
    let filter = { _id: verify.userID._id }; //getting the user that is referenced in the token db object
    let update = { active: true }; //changing the active parameter to true

    //executing the update of the active parameter
    User.findByIdAndUpdate(filter, update, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        //deleteing the token db object after it is used
        VerifyToken.findByIdAndRemove(verify._id, function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
    });

    /*
    upon finding a sucessful token loads the verify page and sends the
    object that was found in the database

    note we really dont need to send the verify shit to the page, was more for testing
    we could just send them to a page that says "congrats, you are now a verified user" or some shit
    */
    res.render('verify', {
      verify: verify //the verify object found int the db
    });
  });
});

//the post for the login page, if the login is sucessful will redirect to dashbaord page
//else will go to the login again
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

//Logout method
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You successfully logged out!');
  req.session.save(function () {
    res.redirect('/users/login');
    return false;
  });
});

//Forgot Password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

//Goes to the forgot page and crypts the login email reset link
router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },

    //Checks if the account email exist before sending the data and redirects the page back
    //to the forgot page
    function(token, done) {
      User.findOne({
        email: req.body.email
      }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },

    //Connects the smtpTransport for email services to send the email for forgot password links
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'chubservices@gmail.com',
          pass: process.env.GMAILPW
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      //Sets up the basic email with the link to reset the password.
      var mailOptions = {
        to: user.email,
        from: 'chubservices@gmail.com',
        subject: 'C-HUB Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      //This is an email success message that lets the user know the email has sent successfully
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
    //This redirects the user to login after changing password
  ], function(err) {
    if (err) return next(err);
    res.redirect('/users/login');
  });
});

//This makes sure that the reset link is expired or not
router.get('/reset/:token', function(req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/forgot');
    }
    res.render('reset', {
      token: req.params.token
    });
  });
});

//Handles the reset password request and allows for the user to change password
router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        //Handles the change password with the schema
        if (req.body.password === req.body.confirm) {
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(req.body.password, salt,
              (err, hash) => {
                if (err) throw err;

                //save password to hash
                req.body.password = hash;
                User.findByIdAndUpdate({
                  _id: user._id
                }, {
                    "password": req.body.password
                  }, function(err, result) {
                    result.resetPasswordToken = undefined;
                    result.resetPasswordExpires = undefined;
                    result.save();

                    if (err) {
                      res.send(err)
                    } else {
                      req.login(user, function(err) {
                        done(err, user);
                      });
                    }
                  })
              }));
        } else {
          req.flash("error", "Passwords do not match.");
          return res.redirect('back');
        }
      });
    },
    //This sends an email to the user when the password has been changed to notify them
    function(user, done) {
      let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'chubservices@gmail.com',
          pass: process.env.GMAILPW
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'chubservices@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello ' + user.username + ',\n\n' +
          'This is a confirmation that the password for your account at ' + user.email + ' has just been changed.\n'
      };
      //Tells the user the password was successfuly changed and logs them into their account
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success_msg', 'Success! Your password has been changed.');
        done(err, 'done');
      });
    }
  ], function(err) {
    res.redirect('/dashboard');
  });
});


module.exports = router;
