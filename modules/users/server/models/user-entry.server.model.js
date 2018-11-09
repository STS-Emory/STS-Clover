'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

/**
 * UserEntry Schema
 */
var UserEntrySchema = new Schema({
  username: {
    type: String,
    trim: true,
    unique: 'Username already exists',
    required: true
  },
  type: {
    type: String,
    trim: true,
    required: true
  },
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  updated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

UserEntrySchema.pre('save', function(next) {
  this.username = this.username.toLowerCase();
  this.type = this.type.toLowerCase();
  this.update = Date.now;

  if((this.firstName && this.lastName) && (this.firstName.length > 0 && this.lastName.length > 0)){
    this.firstName = this.firstName.substring(0,1).toUpperCase()+this.firstName.substring(1).toLowerCase();
    this.lastName = this.lastName.substring(0,1).toUpperCase()+this.lastName.substring(1).toLowerCase();

    if((this.isModified('firstName') || this.isModified('lastName')))
      this.displayName = this.firstName + ' ' + this.lastName;
  }
  next();
});

mongoose.model('UserEntry', UserEntrySchema);
