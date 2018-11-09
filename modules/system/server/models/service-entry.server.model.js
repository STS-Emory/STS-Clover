'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var ServiceEntrySchema = new Schema({
  type: {
    type: String,
    trim: true,
    enum: ['Normal', 'Important', 'Note'],
    default: 'Normal'
  },
  description: {
    type: String,
    trim: true,
    required: true
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('ServiceEntry', ServiceEntrySchema);
