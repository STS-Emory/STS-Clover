'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Message = mongoose.model('Message'),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


mongoose.Promise = global.Promise;

var setUpMessage = function(user) {
  if (user.roles.indexOf('technician') >= 0){
    // find all messages
    Message.find({ type : 'announcement' }, function(err, res){
      var dict = {};
      for (var i = 0; i < res.length; i++){
        if (!dict[res[i].message]){
          dict[res[i].message] = {
            message: res[i].message, 
            to: user, 
            type: 'announcement', 
            from: res[i].from, 
            created: res[i].created 
          };
        }
        
      }

      // Find the messages user has already have notifications
      Message.find({ type : 'announcement', to: user._id }, function(err, user_messages){
        var added = new Set();

        for (var i = 0; i < user_messages.length; i++){
          added.add(user_messages[i].message);
        }

        var err_function = function(err){
          console.error(err);
        };

        // Create new messages for users
        for (var message in dict){
          // Filter the messages alrady exists
          if (!added.has(message)){
            var new_message = new Message(dict[message]);
            new_message.save(err_function);
          }
        }
      });
    });
  }
};

/**
 * Signup
 */
exports.registerUser = function (req, res) {

  if (req.body.randomPwd) req.body.password = User.generateRandomPassphrase();

  // Checking if the user exists
  User.findOne({ username : req.body.username }, function(err, existedUser){
    if(err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    else if(existedUser){
      req.body.roles = req.body.roles.concat(existedUser.roles);
      existedUser = _.extend(existedUser, req.body);
      existedUser.verified = true;

      existedUser.save(function(err){
        if(err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        else {
          existedUser.salt = undefined;
          if(req.body.randomPwd)
            existedUser.password = req.body.password;
          else existedUser.password = undefined;

          res.json(existedUser);

          setUpMessage(existedUser);
        }
      });
    }
    else{
      // Init user and add missing fields
      var user = new User(req.body);
      user.verified = true;
      user.location = 'N/A'; user.phone = '0000000000';
      user.displayName = user.firstName + ' ' + user.lastName;

      user.save(function(err){
        if(err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        else{
          user.salt = undefined;
          if(req.body.randomPwd)
            user.password = req.body.password;
          else user.password = undefined;

          res.json(user);

          setUpMessage(user);
        }
      });
    }
  });
};

exports.resetPwd = function (req, res) {
  if(req.profile){
    var user = req.profile;

    if(user.roles.indexOf('customer') === 0 && user.roles.length === 1)
      return res.status(400).send({ message: 'User does not need password reset.' });

    var pwd = User.generateRandomPassphrase(); user.password = pwd;

    user.save(function(err){
      if(err) return res.status(400).send({ message : errorHandler.getErrorMessage(err) });
      else{
        res.json({ password : pwd });
      }
    });
  }
  else
    return res.status(400).send({ message: 'User does not exist.' });
};

exports.removeTechnicianRole = function (req, res){
  if(req.profile){
    var user = req.profile;
    var idx = user.roles.indexOf('technician');

    if(idx < 0)
      return res.status(400).send({ message: 'User does not have panel role.' });

    user.roles.splice(idx, 1);
    user.save(function(err){
      if(err) return res.status(400).send({ message : errorHandler.getErrorMessage(err) });
      else res.json(user);
    });
  }
  else
    return res.status(400).send({ message: 'User does not exist.' });
};

exports.removeAdminRole = function (req, res){
  if(req.profile){
    var user = req.profile;
    var idx = user.roles.indexOf('admin');

    if(idx < 0)
      return res.status(400).send({ message: 'User does not have panel role.' });

    user.roles.splice(idx, 1);
    user.save(function(err){
      if(err) return res.status(400).send({ message : errorHandler.getErrorMessage(err) });
      else res.json(user);
    });
  }
  else
    return res.status(400).send({ message: 'User does not exist.' });
};