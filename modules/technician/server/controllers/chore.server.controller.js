'use strict';

var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Chore = mongoose.model('Chore');

var populate_options = [
  { path : 'createdBy', model : 'User', select : 'firstName lastName displayName username' },
  { path : 'completedBy', model : 'User', select : 'firstName lastName displayName username' }
];

mongoose.Promise = global.Promise;

exports.create = function(req, res) {
  var chore = new Chore(_.extend(req.body, { createdBy: req.user }));

  chore.save(function(err, chore) {
    if(err) { console.error(err); res.sendStatus(500); }
    else res.json(chore);
  });
};

exports.list = function(req, res) {
  var today = new Date(Date.now()); today.setHours(0);

  Chore.find({ $or : [{ note : '' }, { created : { $gte : today } }, { completed : { $gte : today } }] })
    .sort({ created: -1 }).populate(populate_options)
    .exec(function(err, chores) {
      if(err) { console.error(err); res.statusCode(500); }
      else { res.json(chores); }
    });
};

exports.completeChore = function(req, res) {
  var original = req.chore, updated = req.body, user = req.user;

  updated = _.extend(updated, {
    completedBy : user,
    completed : Date.now()
  });
  original = _.extend(original, updated);

  original.save(function(err, chore) {
    if(err) { console.error(err); res.statusCode(500); }
    else res.json(chore);
  });
};

exports.query = function(req, res) {
  var query = req.body;

  Chore.find(query).populate(populate_options)
    .exec(function(err, chores){
      if(err) { console.error(err); res.statusCode(500); }
      else { res.json(chores); }
    });
};

exports.choreById = function (req, res, next, choreId) {
  if(!choreId)
    return res.status(400).send({ message: 'Chore ID is invalid' });
  else {
    Chore.findOne({ _id: choreId }).populate(populate_options)
      .exec(function(err, chore){
        if (err) return next(err);
        else if (!chore)
          return next(new Error('Chore does not exist: ' + choreId));

        req.chore = chore; next();
      });
  }
};
