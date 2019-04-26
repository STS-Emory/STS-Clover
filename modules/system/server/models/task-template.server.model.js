'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var TaskTemplateSchema = new Schema({
  name : {
    type: String,
    required: true,
    trim: true
  },
  task_details : {
    type: String,
    required: true
  },
  customer_message : {
    type: String,
    required: true
  },
  technician_message : {
    type: String,
    required: true
  },
  chore_instruction : {
    type:  String,
    required: true
  }
});

mongoose.model('TaskTemplate', TaskTemplateSchema);