const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require('bcrypt');
const passport = require('passport');
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
const { findByIdAndUpdate } = require('../models/user.js');

//login handle
router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

//Register handle
router.post('/register', (req, res) => {
  const { username, email, password, password2 } = req.body;
  let errors = [];
  console.log(' username: ' + username + ' Email: ' + email + ' Pass: ' + password);
  if (!username || !email || !password || !password2) {
    errors.push({ msg: "please fill in all fields" });
  }

  //checking if passwords match
  if (password !== password2) {
    errors.push({ msg: "passwords dont match" });
  }

  //checking if password length is above 6 characters
  if (password.length < 6) {
    req.flash('success_msg', 'Password Must be 6 characters or more');
  }

  //checking for the found errors
  if (errors.length > 0) {
    res.render('register', {
      errors: errors,
      username: username,
      email: email,
      password: password,
      password2: password2
    });
  } else {
    //password validation passed
    User.findOne({ email: email }).exec((err, user) => {
      console.log(user);
      if (user) {
        errors.push({ msg: 'email already registered' });
        res.render('register', { errors, username, email, password, password2 });

      } else {
        const newUser = new User({
          username: username,
          email: email,
          password: password
        });

        //hashing the users password to insert into the db
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt,
            (err, hash) => {
              if (err) throw err;

              //save password to hash
              newUser.password = hash;

              //saving the user to the db
              newUser.save()
                .then((value) => {
                  console.log(value);
                  req.flash('success_msg', 'you have now registered!');
                  res.redirect('/users/login');
                }).catch(value => console.log(value));
            }));
      }
    });
  }
});

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
  res.redirect('/users/login');
});

//Forgot Password
router.get('/forgot', function (req, res) {
  res.render('forgot');
});

router.post('/forgot', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },

    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },

    function (token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'chubservices@gmail.com',
          //Need to find way to hide password
          pass: process.env.GMAILPW
        }
      });

      var mailOptions = {
        to: user.email,
        from: 'chubservices@gmail.com',
        subject: 'C-HUB Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        console.log('mail sent');
        req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }

  ], function (err) {
    if (err) return next(err);
    res.redirect('/users/login');
  });
});

router.get('/reset/:token', function (req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/forgot');
    }
    res.render('reset', { token: req.params.token });
  });
});

router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        console.log(req.body.password, '       ', req.body.confirm);

        //Handles the change password with the schema
        if (req.body.password === req.body.confirm) {
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(req.body.password, salt,
              (err, hash) => {
                if (err) throw err;

                //save password to hash
                req.body.password = hash;
                console.log(req.body.password, '       ', hash);
                User.findByIdAndUpdate({ _id: user._id }, { "password": req.body.password }, function (err, result) {
                  user.resetPasswordToken = undefined;
                  user.resetPasswordExpires = undefined;

                  if (err) {
                    res.send(err)
                  }
                  else {
                    req.login(user, function (err) {
                      done(err, user);
                    });
                  }
               
                })
              }));

        }

        else {
          req.flash("error", "Passwords do not match.");
          return res.redirect('back');
        }
      });
    },
    function (user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'chubservices@gmail.com',
          //Need to find way to hide password
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'chubservices@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success_msg', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function (err) {
    res.redirect('/dashboard');
  });
});


module.exports = router;
