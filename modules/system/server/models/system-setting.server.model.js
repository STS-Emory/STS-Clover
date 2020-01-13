'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var validateEmailFormat = function(email){
  var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
  return re.test(email);
};

var SystemSettingSchema = new Schema({
  admin_email: {
    type: String,
    default: 'tuyishkevin@gmail.com',
    validate: [validateEmailFormat, 'Please enter a correct email address!']
  },
  checkin_templates: {
    type: [{
      type: Schema.ObjectId,
      ref: 'KeyValueList'
    }],
    default: []
  },
  task_templates: {
    type: [{
      type: Schema.ObjectId,
      ref: 'TaskTemplate'
    }],
    default: []
  },
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
  this.updated = Date.now(); 

  // Keeping the location options sorted with Off Campus Option in the end
  var index = this.location_options.indexOf('Off campus');
  if (index >= 0){
    this.location_options.splice(index, 1);
  }
  this.location_options.sort();
  if (index >= 0){
    this.location_options.push('Off campus');
  }
  next();
});

mongoose.model('SystemSetting', SystemSettingSchema);
