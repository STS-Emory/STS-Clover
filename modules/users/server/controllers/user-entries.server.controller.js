'use strict';

var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  UserEntry = mongoose.model('UserEntry'),
  userHandler = require(path.resolve('./modules/users/server/controllers/admin.server.controller')),
  User = mongoose.model('User');



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

  var new_user = {
    username : new_entry.username.toLowerCase(),
    roles : ['customer'],
    firstName : new_entry.firstName,
    lastName : new_entry.lastName
  };

  // Register User as customer
  // Checking if the user exists
  User.findOne({ username : new_user.username }, function(err, existedUser){
    if(err){
      console.error(err);
      res.sendStatus(500);
    }
    else if(existedUser){
      new_user.roles = new_user.roles.concat(existedUser.roles);
      existedUser = _.extend(existedUser, new_user);
      existedUser.verified = true;

      existedUser.save(function(err){
        if (err){
          console.error(err);
          res.sendStatus(500);
        }
      });
    }
    else{
      // Init user and add missing fields
      var user = new User(new_user);
      user.verified = true;
      user.location = 'N/A'; user.phone = '0000000000';
      user.displayName = user.firstName + ' ' + user.lastName;

      user.save(function(err){
        if (err){
          console.error(err);
          res.sendStatus(500);
        }
      });
    }
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
