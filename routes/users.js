const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require('bcrypt');
const passport = require('passport');

//login handle
router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

//Register handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  console.log(' Name: ' + name + ' Email: ' + email + ' Pass: ' + password);
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "please fill in all fields" });
  }

  //checking if passwords match
  if (password !== password2) {
    errors.push({ msg: "passwords dont match" });
  }

  //checking if password length is above 6 characters
  if (password.length < 6) {
    errors.push({ msg: "password must be at least 6 characters" });
  }

  //checking for the found errors
  if (errors.length > 0) {
    res.render('register', {
      errors: errors,
      name: name,
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
        res.render('register', { errors, name, email, password, password2 });

      } else {
        const newUser = new User({
          name: name,
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

//logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Now logged out');
  res.redirect('/users/login');
});

module.exports = router;
