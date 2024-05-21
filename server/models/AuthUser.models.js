const mongoose = require('mongoose');

const authUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['moderator', 'user'],
    required: true,
    default: 'user',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  city: {
    type: String,
    required: false,
    unique: false,
    default: '',
  },
  district: {
    type: String,
    required: false,
    unique: false,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const AuthUserModel = mongoose.model('authUser', authUserSchema);

module.exports = AuthUserModel;
