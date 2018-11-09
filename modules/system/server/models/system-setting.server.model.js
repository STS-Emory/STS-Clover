'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var SystemSettingSchema = new Schema({
  user_wildcard_prefixes : {
    type: [{
      type: String,
      trim: true
    }],
    default: []
  },
  location_options : {
    type: [{
      type: String,
      trim: true
    }],
    default: []
  },
  computer_options : {
    type: [{
      type: Schema.ObjectId,
      ref: 'KeyValueList'
    }],
    default: []
  },
  computer_os_editions : {
    type: [{
      type: String,
      trim: true
    }],
    default: []
  },
  checkin_items : {
    type: [{
      type: String,
      trim: true
    }],
    default: []
  },
  device_options: {
    type: [{
      type: Schema.ObjectId,
      ref: 'KeyValueList'
    }],
    default: []
  },
  scheduler_settings : {
    type: [{
      type: String,
      trim: true
    }],
    default: []
  },
  servicenow_liveSync : {
    type: Boolean,
    default: false
  },
  updated : {
    type: Date,
    default: Date.now()
  }
});

SystemSettingSchema.pre('save', function (next) {
  this.updated = Date.now(); next();
});

mongoose.model('SystemSetting', SystemSettingSchema);
