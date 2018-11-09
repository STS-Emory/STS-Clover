'use strict';

var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Chore = mongoose.model('Chore'),
  SITask = mongoose.model('SITask');

var populate_options = [
  { path : 'createdBy', model : 'User', select : 'username displayName' }, { path : 'chores', model : 'Chore' }
];

var populate_options_chore = [
  { path : 'chores.createdBy', model : 'User', select : 'firstName lastName displayName username' },
  { path : 'chores.completedBy', model : 'User', select : 'firstName lastName displayName username' }
];

mongoose.Promise = global.Promise;

exports.create = function(req, res) {
  var sitask = new SITask(req.body), user = req.user;
  sitask.createdBy = user;

  sitask.save(function (err, sitask) {
    if(err) { console.error(err); res.sendStatus(500); }
    else res.json(sitask);
  });
};

exports.list = function(req, res) {
  SITask.find({ walkin : { $exists : false } }).populate(populate_options)
    .sort({ created : 1 }).exec(function(err, sitasks) {
      if(err) { console.error(err); res.sendStatus(500); }
      else {
        Chore.populate(sitasks, populate_options_chore, function (err, sitasks) {
          if(err) { console.error(err); res.sendStatus(500); }
          else res.json(sitasks);
        });
      }
    });
};

exports.update = function(req, res) {
  var sitask = req.sitask, updates = req.body;
  sitask = _.extend(sitask, updates);

  sitask.save(function(err, sitask) {
    if(err){ console.error(err); res.sendStatus(500); }
    else res.json(sitask);
  });
};

exports.view = function(req, res) {
  res.json(req.sitask);
};

exports.sitaskByUsername = function (req, res) {
  var username = req.params.username;

  SITask.find({ username : username, walkin : { $exists : false } })
    .sort({ created : 1 }).populate(populate_options)
    .exec(function(err, sitask) {
      if(err){ console.error(err); res.sendStatus(500); }
      else {
        Chore.populate(sitask, populate_options_chore, function (err, sitask) {
          if(err) { console.error(err); res.sendStatus(500); }
          else res.json(sitask);
        });
      }
    });
};

exports.query = function(req, res) {
  var query = req.body;
  SITask.find(query).populate(populate_options)
    .exec(function(err, sitasks){
      if(err) { console.error(err); res.statusCode(500); }
      else {
        Chore.populate(sitasks, populate_options_chore, function (err, sitasks) {
          if(err){ console.error(err); res.sendStatus(500); }
          else res.json(sitasks);
        });
      }
    });
};

exports.sitaskById = function(req, res, next, sitaskId) {
  SITask.findOne({ _id : sitaskId }).populate(populate_options)
    .exec(function(err, sitask) {
      if(err){ console.error(err); next(); }
      else {
        Chore.populate(sitask, populate_options_chore, function (err, sitask) {
          if(err) { console.error(err); next(); }
          else { req.sitask = sitask; next(); }
        });
      }
    });
};
