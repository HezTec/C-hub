const mongoose = require('mongoose');
const VerifySchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  verifyToken: {
    type: String,
    required: true
  },

  verifyTokenExpire: {
    type: Date
  }
});

const VerifyUser = mongoose.model('VerifyUser', VerifySchema, 'verifyList');

module.exports = VerifyUser;
