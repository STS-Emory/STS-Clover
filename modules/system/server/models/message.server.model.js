'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

// Schema
var MessageSchema = new Schema({
  type: {
    type: String, required: true,
    enum: ['flag', 'notification', 'announcement']
  },

  to: { type: Schema.ObjectId, ref: 'User' },
  from: { type: Schema.ObjectId, ref: 'User' },
  created: { type: Date, default: Date.now },

  read: { type: Date },
  message: { type: String, trim: true, required: true },

  sitask: { type: Schema.ObjectId, ref: 'SITask' }
});

mongoose.model('Message', MessageSchema);
