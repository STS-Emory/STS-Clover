'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator'),
  generatePassword = require('generate-password'),
  owasp = require('owasp-password-strength-test');

mongoose.Promise = global.Promise;

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

var validatePhoneLength = function (property) {
  return property.length === 10;
};

/**
 * User Schema
 */
var UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your first name']
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your last name']
  },
  displayName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: '',
    validate: [validatePhoneLength, 'Invalid length for phone number']
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  username: {
    type: String,
    unique: 'Username already exists',
    required: 'Please fill in a username',
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    default: ''
  },
  salt: {
    type: String
  },
  profileImageURL: {
    type: String,
    default: 'img/profile/default_avatar.png'
  },
  roles: {
    type: [{
      type: String,
      enum: ['customer', 'technician', 'admin']
    }],
    default: ['customer']
  },
  verified: {
    type: Boolean,
    default: false
  },
  isWildcard: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updated: {
    type: Date,
    default: Date.now
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  if((this.firstName && this.lastName)){
    this.firstName = this.firstName.substring(0,1).toUpperCase()+this.firstName.substring(1).toLowerCase();
    this.lastName = this.lastName.substring(0,1).toUpperCase()+this.lastName.substring(1).toLowerCase();

    if((this.isModified('firstName') || this.isModified('lastName')))
      this.displayName = this.firstName + ' ' + this.lastName;
  }

  // Remove duplicated roles
  if(this.roles){
    var roles = {};
    for(var i = 0; i < this.roles.length; i++)
      if(!roles[this.roles[i]]) roles[this.roles[i]] = 1;
    this.roles = Object.keys(roles);
  }

  this.updated = Date.now;
  next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
  } else {
    return password;
  }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

/**
* Generates a random passphrase that passes the owasp test
* Returns a promise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
* NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
*/
UserSchema.statics.generateRandomPassphrase = function () {
  return generatePassword.generate({
    length: 12, numbers: true, symbols: false, uppercase: true, excludeSimilarCharacters: true
  });
};

mongoose.model('User', UserSchema);
