'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User'),
  _ = require('lodash');

mongoose.Promise = global.Promise;

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user)
      res.status(400).send(info);
    else if(user.roles.length === 0 || (user.roles.length === 1) && user.roles[0] === 'customer')
      res.status(400).send('User does not have sufficient permission.');
    else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err) {
        if (err) res.status(400).send(err);
        else res.json(user);
      });
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout(); res.status(200).send();
};
