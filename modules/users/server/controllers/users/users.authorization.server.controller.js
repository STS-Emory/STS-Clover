'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

mongoose.Promise = global.Promise;

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'User is invalid' });
  }

  User.findOne(
    { _id: id }, '-password -salt',
    function(err, user){
      if (err) return next(err);
      else if (!user)
        return next(new Error('Failed to load User ' + id));
      req.profile = user; next();
    }
  );
};

exports.userByUsername = function(req, res, next, username){
  if(!username) next();
  else {
    User.findOne(
      { username: username }, '-password -salt',
      function(err, user){
        if(err) return next(err);

        if(!user) req.netid = username;
        else req.profile = user;
        next();
      }
    );
  }
};

exports.hasAdminPermission = function(req, res, next){
  if (!req.isAuthenticated())
    return res.status(401).send({ message: 'User is not logged in' });
  if (_.intersection(req.user.roles, ['admin']).length === 0)
    return res.status(403).send({ message: 'User is not authorized' });
  else next();
};

exports.hasTechnicianPermission = function(req, res, next){
  if (!req.isAuthenticated())
    return res.status(401).send({ message: 'User is not logged in' });
  if (_.intersection(req.user.roles, ['technician', 'admin']).length === 0)
    return res.status(403).send({ message: 'User is not authorized' });
  else next();
};
