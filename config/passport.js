const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require("../models/user");

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      //match the user
      User.findOne({ email: email })
        .then((user) => {

          //checks if email isnt in the DB
          if (!user) {
            return done(null, false, { message: 'That email is not registered' });
          }

          //checks if the user has clicked the email verification link and if not stops them from logging in
          if (user.active == false) {
            return done(null, false, { message: 'Please verify your email to log in' });
          }

          //match the password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          });
        })
        .catch((err) => { console.log(err) });
    })
  );


  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
