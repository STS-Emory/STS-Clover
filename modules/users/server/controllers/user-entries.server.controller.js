'use strict';

var _ = require('lodash'),
  mongoose = require('mongoose'),
  UserEntry = mongoose.model('UserEntry');

mongoose.Promise = global.Promise;

exports.create = function(req, res) {
  var new_entry = req.body;

  UserEntry.findOne({ username : new_entry.username.toLowerCase() }, function(err, entry){
    if(err) { console.error(err); res.sendStatus(500); }

    if(entry) entry = _.extend(entry, new_entry);
    else entry = new UserEntry(new_entry);

    entry.save(function(err) {
      if(err) { console.error(err); res.sendStatus(500); }
      else res.jsonp(entry);
    });
  });
};

exports.view = function(req, res) {
  res.json(req.entry);
};

exports.update = function(req, res) {
  var entry = _.extend(req.entry , req.body);
  entry.save(function(err) {
    if(err) { console.error(err); res.sendStatus(500); }
    else res.jsonp(entry);
  });
};

exports.delete = function(req, res) {
  var entry = _.extend(req.entry , { isActive : false });
  entry.save(function(err) {
    if(err) { console.error(err); res.sendStatus(500); }
    else res.jsonp(entry);
  });
};

exports.entryByUsername = function(req, res, next, username) {
  UserEntry.findOne({ username : username }, function(err, entry){
    if(err) { console.error(err); res.sendStatus(500); }
    if(!entry) req.entry = null;
    else req.entry = entry;
    next();
  });
};
