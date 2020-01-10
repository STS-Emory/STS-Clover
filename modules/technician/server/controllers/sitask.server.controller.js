'use strict';

var _ = require('lodash'),
  mongoose = require('mongoose'),
  async = require('async'),
  User = mongoose.model('User'),
  Chore = mongoose.model('Chore'),
  SITask = mongoose.model('SITask'),
  SystemSetting = mongoose.model('SystemSetting');

var populate_options = [
  { path : 'createdBy', model : 'User', select : 'username displayName' }, 
  { path : 'chores', model : 'Chore' }
];

var populate_options_chore = [
  { path : 'chores.createdBy', model : 'User', select : 'firstName lastName displayName username' },
  { path : 'chores.completedBy', model : 'User', select : 'firstName lastName displayName username' }
];

var template_options = [
  { path : 'task_templates', model: 'TaskTemplate' }
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
    .sort({ created : -1 }).exec(function(err, sitasks) {
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

  async.each(sitask.chores, function(chore, callback){
    Chore.update({ _id: chore._id }, chore, { upsert: true },function(err){
      callback(err);
    });
  }, function(err){
    if (err){
      console.error(err);
    } else{
      sitask.save(function(err, sitask) {
        if(err){ console.error(err); res.sendStatus(500); }
        else res.json(sitask);
      });
    }
  });
};

exports.view = function(req, res) {
  res.json(req.sitask);
};

exports.sitaskByUsername = function (req, res) {
  var username = req.params.username;

  SITask.find({ username : username, walkin : { $exists : false } })
    .sort({ created : -1 }).populate(populate_options)
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

exports.settings = function (req, res){
  SystemSetting.findOne({}, '-updated').populate(template_options).exec(function(err, setting){
    if(err) req.setting = null;
    else {
      res.json(setting.task_templates);
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

exports.deleteSITask = function(req, res){
  var sitaskId= req.body._id;
  SITask.findByIdAndRemove(sitaskId, function(sitask, err){
    if (err) console.log(err);
    else{ 
      res.sendStatus(200);
      console.log('Sitask Deleted: '+'\n'+req.body.description);}
  });
};

exports.deleteMany =function (req, res) {
  var entries = [];
  if(req.body){
    var arr = req.body;
    arr.forEach(function(item){
      entries.push(item._id);
    });
  }
  SITask.deleteMany({ _id: { $in:entries} }).then( function (err) {
    if(err) console.log(err);
    else{
      res.select(200);
      console.log(req.body.length + "Sitask Deleted");
    }
  });
};
