'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var KeyValueListSchema = new Schema({
  key : {
    type: String,
    trim: true,
    required: true
  },
  values : {
    type: [{ type: String, trim: true }],
    default: []
  },
  updated : {
    type: Date,
    default: Date.now()
  }
});

KeyValueListSchema.pre('save', function (next) {
  this.updated = Date.now();
  this.values.sort(); next();
});

mongoose.model('KeyValueList', KeyValueListSchema);
