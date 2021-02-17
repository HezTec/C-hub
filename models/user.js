const mongoose = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
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
  }
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);
