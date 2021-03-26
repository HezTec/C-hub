const mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

mongoose.set('useFindAndModify', false);

const ReportSchema = new mongoose.Schema({

  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  reports: {
    type: [{ reason: String, comment: String, linkIndex: Number }]//the link index is where th link is at in the userdb
  }
})

const ReportUser = mongoose.model('ReportUser', ReportSchema, 'reportList');

module.exports = ReportUser;
