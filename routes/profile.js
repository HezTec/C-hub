/**
  Routing file for handling user profile requests
*/

const express = require('express');
const router = express.Router();
const User = require("../models/user.js");
const { ensureAuthenticated } = require("../config/auth.js");
const Report = require("../models/report.js");

/*
  code to get individual user pages and display their content
*/
router.get('/:userProfile', function(req, res) {
  //querying the db for the username that goes to the username in the url request
  User.findOne({
    username: req.params.userProfile
  }).exec(function(err, user) {
    //if that user isnt in the db, will redirect to the home screen
    if (!user) {
      req.flash('error', '  That user does not exsist');
      return res.redirect('/dashboard');
    } else if (user.suspended == true) { //checking if the users account is suspended and loading the suspended page if they are
      res.render('notFounds/suspended', {
        auth_info: req.isAuthenticated()
      });
    } else {
      //renering the profile and its info dynamically to the page
      res.render('profile', {
        user: user,//the users whos profile is being loaded
        auth_info: req.isAuthenticated()//the check to see if a user is logged in or not
      });
    }
  });
});


/*
  Code to gather user reports and save them to the db
*/
router.post('/report', function(req, res) {

  User.findOne({
    username: req.body.username
  }).exec(function(err, user) {
    if (!user) {
      req.flash('error', 'that user does not exsist');
      return res.redirect('/');
    }

    /*
    this code will check if the user has reports already
    if so it will add this new report to the list,
    else it will create a new db entry for that user
    */
    Report.findOne({
      userID: user._id
    }).exec(function(err, report) {
      if (!report) {

        //creating the new report db object
        let newReport = new Report({
          userID: user._id,
          reports: [{
            reason: req.body.reason,
            comment: req.body.comment
          }]
        });
        newReport.save();

      } else {
        report.reports.push({
          reason: req.body.reason,
          comment: req.body.comment
        });
        report.save();
      }
    });
  })
});


module.exports = router;
