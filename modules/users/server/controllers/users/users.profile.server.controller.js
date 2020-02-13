'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User');

mongoose.Promise = global.Promise;

var sanitizeUser = function(user, attributes) {
  var res = {};
  for (var attribute in user){
    if (attributes.indexOf(attribute) == -1){
      res[attribute] = user[attribute];
    }
  }
  return res;
};

exports.sanitizeUser = sanitizeUser;

exports.update = function (req, res) {
  var user = req.profile; 
  var updated;
  if (_.intersection(req.user.roles, ['admin']).length === 0){
    // technicians cannot send requests on role / password change
    updated = sanitizeUser(req.body, ['roles', 'password', 'isActive', 'hash']);
  } else{
    updated = sanitizeUser(req.body, ['password', 'hash']);
  }

  user = _.extend(user, updated);
  user.save(function(err, user){
    if(err) {
      console.error(err);
      return res.sendStatus(500);
    }
    else res.json(user);
  });
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var upload = multer(config.uploads.profileUpload).single('newProfilePicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;
  
  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  if (user) {
    upload(req, res, function (uploadError) {
      if(uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else {
        user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
