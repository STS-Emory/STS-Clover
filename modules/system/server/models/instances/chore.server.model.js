'use strict';

var mongoose = require('mongoose'),
  autoIncrement = require('mongoose-auto-increment'),
  Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var ChoreSchema = new Schema({
  type : { type : String, enum : ['automated', 'general'], default: 'general' },

  instruction: { type: String, required: true, trim: true },
  note: { type: String, default: '', trim: true },

  createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
  created: { type: Date, default: Date.now },

  completedBy: { type: Schema.ObjectId, ref: 'User' },
  completed: { type: Date }
});

ChoreSchema.plugin(autoIncrement.plugin, 'Chore');
mongoose.model('Chore', ChoreSchema);
