'use strict';

var mongoose = require('mongoose'),
  autoIncrement = require('mongoose-auto-increment'),
  Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var SITaskSchema = new Schema({
// Core information
  username: { type: String, trim: true, required: true },
  description: { type: String, default: '', trim: true },
  walkin: { type: Number, ref: 'Walkin' },

// Notification/Display information
  msg_NotifyCustomer: { type: String, default: '', trim: true },
  msg_DisplayCustomer: { type: String, default: '', trim: true },

  msg_DisplayTechnician: { type: String, default: '', trim: true },

//  Tracking information
  createdBy: {
    type: Schema.ObjectId, ref: 'User', required: true
  },
  created: { type: Date, default: Date.now() },
  chores: { type: [Number], ref: 'Chore', default: [] }
});

SITaskSchema.plugin(autoIncrement.plugin, 'SITask');
mongoose.model('SITask', SITaskSchema);
