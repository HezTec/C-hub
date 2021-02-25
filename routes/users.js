const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const VerifyToken = require("../models/verify.js");
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const passport = require('passport');
const nodemailer = require('nodemailer');
const { ensureAuthenticated } = require("../config/auth.js");
const { findByIdAndUpdate } = require('../models/user.js');

//login handle
router.get('/login', (req, res) => {
  res.render('login');
});

//register handle
router.get('/register', (req, res) => {
  res.render('register');
});

//The handler for the the registeration of the page
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;//getting the data from the page
  let errors = []; //array that gathers errors to display to the user


  //making sure all fields are entered
  if (!name || !email || !password || !password2) {
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
      name: name,
      email: email,
      password: password,
      password2: password2
    });
  } else {
    //password validation passed, now below code checks to see if user has already been registered
    User.findOne({
      email: email
    }).exec((err, user) => {
      if (user) {
        errors.push({
          msg: 'email already registered'
        });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });

      } else {

        //creating a new user for the db
        const newUser = new User({
          name: name,
          email: email,
          password: password,
        });

        //making the email verificaiton token with a random hex string
        var genVerifyToken = crypto.randomBytes(20).toString('hex');

        //adding the users verify token to the token DB
        const newVerifyToken = new VerifyToken({
          userID: newUser._id,
          verifyToken: genVerifyToken,
          verifyTokenExpire: Date.now() + 3600000// 1 hour
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
                  res.redirect('/users/login');
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
                  'If this wasn\'t you please contact chubservices@gamil.com for help.\n'
              };
              //sending the mail
              smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
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
  }).populate('userID').exec(function(err, verify) {//this function checks that the token was found and if not redirects to the login page
    if (!verify) {
      req.flash('error', 'verify token invalid');
      return res.redirect('/users/login');
    }
    let filter = { _id: verify.userID._id };//getting the user that is referenced in the token db object
    let update = { active: true };//changing the active parameter to true

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
      verify: verify//the verify object found int the db
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

//logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Now logged out');
  res.redirect('/users/login');
});

module.exports = router;
