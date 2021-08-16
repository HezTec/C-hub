const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require("../models/user.js");
const Report = require("../models/report.js");
const {
  ensureAuthenticated
} = require("../config/auth.js");

//redners the admin dashboard page
router.get('/', ensureAuthenticated, (req, res) => {
  res.render("admin/adminDashboard", {
    user: req.user
  });
});

//post method for adding a new admin based on email
router.post('/add', (req, res) => {
  User.findOne({
    email: req.body.newAdminEmail
  }).exec(function(err, user) {
    if (!user) {
      req.flash('error', 'That email does not exsist in the system');
      return res.redirect('/admin')
    }

    user.admin = true;
    user.save();
    req.flash('success_msg', user.username + ' has been granted admin status')
    res.redirect('/admin'); //redirecting back to the same page with the success message

  });
});


router.post('/delete', (req, res) => {
  // if (req.user._id == '6059336ccffd2d2ca0fce555') {//only the head admin can delete other admins
  User.findOne({
    email: req.body.newAdminEmail
  }).exec(function(err, user) {
    if (!user) {
      req.flash('error', 'That email does not exsist in the system');
      return res.redirect('/admin')
    }

    user.admin = false;
    user.save();
    req.flash('success_msg', user.username + ' has been removed as an admin')
    res.redirect('/admin'); //redirecting back to the same page with the success message

  });
  // }
});

/*
  displaying all the users that have over 5 reports to their accounts
*/
router.get('/reports', (req, res) => {
  Report.find({
    'reports.5': {
      '$exists': true
    }
  }).populate('userID').exec(function(err, reports) {
    res.render('admin/reports', {
      reports: reports //array of all the reports
    })
  })
});

//the report post which gets all the reports that are greater than the specified length
router.post('/reports', (req, res) => {
  if (req.body.reportsNumber <= 0) {
    req.flash('error', 'not a valid input');
    return res.redirect('/admin/reports');
  }

  Report.find({
    reports: {
      '$exists': true
    },
    '$where': 'this.reports.length >' + req.body.reportsNumber
  })
    .populate('userID').exec(function(err, reports) {
      res.render('admin/reports', {
        reports: reports //array of all the reports
      })
    })

});

/*
  upon clicking the delete button next to a user, will reidrect them to an "are your sure page"
*/
router.post('/deleteUser/:userID', (req, res) => {
  User.findOne({
    _id: req.params.userID
  }).exec(function(err, user) {
    if (!user) {
      req.flash('error', 'User not found')
    }
    res.render('admin/deleteUser', {
      deletedUser: user //the user to be deleted
    })
  });
});

/*
  this post deletes both the user and all of their reports from the database
*/
router.post('/deleteUser/delete/:userID', (req, res) => {
  //deleting the user from the user db
  User.deleteOne({
    _id: req.params.userID
  }).exec(function(err, user) {
    if (!user) {
      req.flash('error', 'User not found');
    }

    //deleting the report from the reports db
    Report.deleteOne({
      userID: req.params.userID
    }).exec(function(err, report) {
      if (!report) {
        req.flash('error', 'report not found');
      }
    });

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
      subject: 'Account deletion',
      text: 'Hello ' + user.username + ',\n\n' +
        'The moderation team has decided to delet your account, if you think this is wrong please contact us\n'
    };
    //Tells the user the password was successfuly changed and logs them into their account
    smtpTransport.sendMail(mailOptions, function(err) {
    });

    req.flash('success_msg', 'user sucessfully deleted');
    res.redirect('/admin'); //redirecting back to the admin dashboard after
  });
});

/*
  this post sends both user info and report info to the reportList page to display all the reports
  on the users account
*/
router.post('/reportList/:userID', (req, res) => {
  User.findOne({
    _id: req.params.userID
  }).exec(function(err, user) {
    if (!user) {
      req.flash('error', 'no user found');
      return res.redirect('/admin');
    }

    Report.findOne({
      userID: req.params.userID
    }).exec(function(err, report) {
      if (!report) {
        req.flash('error', 'no reports found');
        return res.redirect('/admin');
      }

      res.render('admin/reportList', {
        user: user,
        report: report
      });
    })
  })
});

router.post('/suspendUser/:userID', (req, res) => {
  //finding the user to suspend
  User.findOne({ _id: req.params.userID }).exec(function(err, user) {
    if (!user) {
      req.flash('error', 'No user found');
      return res.redirect('/admin');
    }
    //sending the user to the "are you sure?" page
    res.render('admin/suspendUser', {
      suspendUser: user
    });
  });
});

router.post('/suspendUser/suspend/:userID', (req, res) => {
  //finding the user to suspend via the given url
  User.findOne({ _id: req.params.userID }).exec(function(err, user) {
    if (!user) {
      req.flash('error', 'No user found');
      return res.redirect('/admin');
    }
    user.suspended = true;//setting the suspention value to tru to suspend a user
    user.save();

    //mailing the user that has been suspended notifying them that they have been suspended
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
      subject: 'Account suspention',
      text: 'Hello ' + user.username + ',\n\n' +
        'The moderation team has decided to suspend your account, if you think this is wrong please contact us\n'
    };

    //lets the admin know that the user has been sucessfully banned
    smtpTransport.sendMail(mailOptions, function(err) {
    });

    req.flash('success_msg', 'User suspended');
    res.redirect('/admin');

  });
});

router.post('/unsuspendUser/:userID', (req, res) => {
  //finding the user to un suspend
  User.findOne({ _id: req.params.userID }).exec(function(err, user) {
    if (!user) {
      req.flash('error', 'No user found');
      return res.redirect('admin/suspendUser');
    }

    //updating the users values in the DB
    user.suspended = false;
    user.save();
    req.flash('success_msg', 'User sucessfully unsuspended');
    res.redirect('/admin');

  });
});

router.get('/suspendedList', (req, res) => {
  //getting a list of all suspended users to display
  User.find({ suspended: true }).exec(function(err, list) {
    if (!list) {
      req.flash('error', 'no users found');
      return res.redirect('/admin');
    }

    //sending the list to the front end to disply
    res.render('admin/suspendedList', {
      suspendedList: list
    })
  });
});


module.exports = router;
