'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var LibraryGuidanceSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  task: {
    type: String,
    required: true,
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('LibraryGuidance', LibraryGuidanceSchema);
