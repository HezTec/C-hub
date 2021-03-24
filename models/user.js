const mongoose = require('mongoose');
require('mongoose-type-url');
var passportLocalMongoose = require("passport-local-mongoose");

mongoose.set('useFindAndModify', false);

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String,
  },

  resetPasswordExpires: {
    type: Date,
  },

  active: {
    type: Boolean,
    default: false
  },

  testPhrase: {
    type: String,
    default: 'this is the test string'
  },

  // links: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Link"
  // },

  urls: [{
    title: String,
    url: mongoose.SchemaTypes.Url
  }]

});

UserSchema.plugin(passportLocalMongoose);

var User = module.exports = mongoose.model('User', UserSchema, 'userList');
