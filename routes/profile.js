/**
  Routing file for handling user profile requests
*/

const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const { ensureAuthenticated } = require("../config/auth.js");
const Report = require("../models/report.js");

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    user: req.user
  });
});
router.post('/dashboard', (req, res) => {
  res.render('dashboard');
});
/*
  code to get individual user pages and display their content
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


/*
  Code to gather user reports and save them to the db
*/
router.post('/:userProfile', function(req, res) {
<<<<<<< HEAD

  User.findOne({ username: req.body.username }).exec(function(err, user) {
=======
  User.findOne({ username: req.params.userProfile }).exec(function(err, user) {
>>>>>>> 802c937e3ac250c1d9c38a1c7172da60d831c49b
    if (!user) {
      req.flash('error', 'that user does not exsist');
      return res.redirect('/');
    }
<<<<<<< HEAD
    console.log(req.body.reason + " " + req.body.comment + " to:" + req.body.username);
=======
    console.log(req.body.reason + " " + req.body.comment);
>>>>>>> 802c937e3ac250c1d9c38a1c7172da60d831c49b
    //the reports will consist of  a title, a comment, and an index with the index being the index of the link in the user db
    //with that we can find the specific link in question and possibly somehow link to it for an easy admin view.


    //this code searches the report db for a users set of reports
    //if it finds one it will update it [TODO]
    //if not it will create a new entry in the db
    Report.findOne({ userID: user._id }).exec(function(err, report) {
      if (!report) {

        //creating the new report db object
        let newReport = new Report({
          userID: user._id,
          reports: [{ reason: req.body.reason, comment: req.body.comment }]
        });

        newReport.save()
      } else {
        console.log('updating report db')//placeholder until the update code is written
      }
    });



  })
});


module.exports = router;
