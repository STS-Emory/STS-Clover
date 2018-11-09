'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User');

mongoose.Promise = global.Promise;

exports.query = function(req, res) {
  var query = req.body;

  User.find(query).exec(function(err, users) {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    else res.json(users);
  });
};

exports.technician = function(req, res) {
  User.find({ isActive : true, roles : { $in : ['admin', 'technician'] } })
    .select('-salt -password').exec(function(err, users) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      else res.json(users);
    });
};

exports.invalid = function(req, res) {
  User.find({ $or : [{ isActive : false }, { verified : false }] })
    .select('-salt -password').exec(function(err, users) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      else res.json(users);
    });
};
