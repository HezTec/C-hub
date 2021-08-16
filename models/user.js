const mongoose = require('mongoose');
require('mongoose-type-url');
var passportLocalMongoose = require("passport-local-mongoose");

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

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

  admin: {
    type: Boolean,
    default: false
  },

  suspended: {
    type: Boolean,
    default: false
  },

  urls: [{
    title: String,
    url: mongoose.SchemaTypes.Url
  }],

  embeds: [{
    title: String,
    url: String
  }]


});

UserSchema.plugin(passportLocalMongoose);

var User = module.exports = mongoose.model('User', UserSchema, 'userList');
