'use strict';

var _ = require('lodash'),
  async = require('async'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Message = mongoose.model('Message');

var popOpt = [
  { path: 'to', model : 'User', select : 'username displayName profileImageURL' },
  { path: 'from', model : 'User', select : 'username displayName profileImageURL' }
];

mongoose.Promise = global.Promise;

exports.create = function(req, res) {
  var from = req.user, to = req.profile;
  var message = new Message(_.extend(req.body, { from : from, to : to }));
  
  message.save(function(err, message) {
    if(err) { console.error(err); res.sendStatus(500); }
    else res.json(message);
  });
};

exports.createAnnouncement = function(req, res) {
  var error, template = _.extend(req.body, { from : req.user, type : 'announcement' });

  var message4user = null;
  User.find({ roles: { $in: ['admin', 'technician'] }, isActive: true },
    function(err, technicians) {
      if(err){ console.error(err); res.status(500).json(message4user); }
      else {
        async.each(technicians,
          function(technician, callback) {
            var message = new Message(_.extend(template, { to: technician }));

            message.save(function(err, message){
              if(err){ console.error(err); callback(err); }
              else {
                if(req.user.username == technician.username)
                  message4user = message;

                callback();
              }
            });
          },
          function(err) {
            if(err) error = err;
            res.json(message4user);
          }
        );
      }
    });
};

exports.markAsRead = function(req, res) {
  Message.findOne({ _id: req.body._id }, function(err, message) {
    if(err) { console.error(err); res.sendStatus(500); }
    else {
      message.read = Date.now();
      message.save(function(err, message) {
        if(err) { console.error(err); res.sendStatus(500); }
        else res.json(message);
      });
    }
  });
};

exports.getAnnouncements = function(req, res) {
  Message.find({ type : 'announcement', $or : [{ to : req.user }, { to : { $exists: false } }] })
    .sort('created').populate(popOpt).exec(function(err, messages) {
      if(err) { console.error(err); res.sendStatus(500); }
      else res.json(messages);
    });
};
