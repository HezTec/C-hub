const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const { ensureAuthenticated } = require("../config/auth.js");

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    user: req.user
  });
});
router.post('/dashboard', (req, res) => {
  res.render('dashboard');
});
/*
  CURRENTLY A TEST ROUTE TO GET INDIVIDUAL USER PAGES WHICH WORKS
*/
router.get('/:userProfile', function(req, res) {
  //querying the db for the username that goes to the username in the url request
  User.findOne({ username: req.params.userProfile }).exec(function(err, user) {
    //if that user isnt in the db, will redirect to the home screen
    if (!user) {
      req.flash('error', '  That user does not exsist');
      return res.redirect('/dashboard');
    }
    //renering the profile and its info dynamically to the page
    res.render('profile', {
      user: user
    });

  });
});

module.exports = router;
