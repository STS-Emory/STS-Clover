'use strict';

var mongoose = require('mongoose'),
  format = require('string-format'),
  schedule = require('node-schedule'),
  User = mongoose.model('User'),
  Walkin = mongoose.model('Walkin'),
  Checkin = mongoose.model('Checkin'),
  mailer = require('./mailer.server.controller.js'),
  sn = require('./service-now.server.controller.js'),
  system = require('./system.server.controller.js');

mongoose.Promise = global.Promise;

var popOpt = [
  { path : 'user', model : 'User', select : 'displayName username isWildcard' }
];

var
  WalkinSurveyBroadcast = function() {
    return schedule.scheduleJob('0 0 9-19 * * 1-5', function(){
      var i, user, start = new Date(Date.now()-60*60*1000), end = new Date(Date.now());

      Walkin.find({ status : 'Completed', isActive : true, resolutionTime : { $gte: start, $lt : end },
        resolutionType : { $nin : ['N/A', 'Check-in'] } }).select('user -_id')
        .populate(popOpt).exec(function(err, walkins){
          if(err) return console.error(err);

          for(i = 0; i < walkins.length; i++){
            user = walkins[i].user;
            if(!user.isWildcard)
              mailer.sendSurvey(mailer.WALKIN, user.username+'@emory.edu', user.displayName);
          }
        });
    });
  },
  CheckinSurveyBroadcast = function() {
    return schedule.scheduleJob('0 1 9-19 * * 1-5', function(){
      var i, user, start = new Date(Date.now()-60*60*1000), end = new Date(Date.now());

      Checkin.find({ status : 'Completed', isActive : true, completionTime : { $gte: start, $lt : end } })
        .select('user -_id').populate(popOpt).exec(function(err, checkins){
          if(err) return console.error(err);

          for(i = 0; i < checkins.length; i++){
            user = checkins[i].user;
            if(!user.isWildcard)
              mailer.sendSurvey(mailer.CHECKIN, user.username+'@emory.edu', user.displayName);
          }
        });
    });
  },
  ServiceNowBatchSync = function() {
    return schedule.scheduleJob('0 0 19 * * 1-5', function(){
      sn.syncUnsyncedTickets(sn.CREATE, sn.WALKIN);
      sn.syncUnsyncedTickets(sn.CREATE, sn.CHECKIN);
    });
  },
  UnclosedWalkinEmailNotification = function() {
    return schedule.scheduleJob('0 30 18 * * 1-5', function() {
      Walkin.find({ status : { $in : ['In queue', 'Work in progress'] }, isActive : true })
        .count(function (err, count) {
          if(err) return console.error(err);

          if(count)
            mailer.send(system.setting.admin_email, 'Clover: Unclosed Walk-in Tickets', '',
              'Important: There are ' + count + ' walk-in ticket(s) remains in the queue. Please take action to close them.');
        });
    });
  };

// Module variables
exports.jobs = [];
exports.TASKS = {
  'Hourly Walk-in Survey Broadcast' : WalkinSurveyBroadcast,
  'Hourly Check-in Survey Broadcast' : CheckinSurveyBroadcast,
  'ServiceNow Batch Sync @ 7:00pm' : ServiceNowBatchSync,
  'Unclosed Walk-in Ticket check @ 6:30pm' : UnclosedWalkinEmailNotification
};

exports.init = function(setting, callback){
  console.log('#### System scheduler information');
  var task, scheduler_settings = setting.scheduler_settings;

  if(scheduler_settings.length > 0){
    for(var idx = 0; idx < scheduler_settings.length; idx++){
      task = scheduler_settings[idx];
      if(exports.TASKS[task]){
        exports.jobs.push(exports.TASKS[task]);

        exports.TASKS[task]();
        console.log(format('Scheduler task initialized: {}', task));
      }
      else console.error(format('Unrecognized scheduler task : {}', task));
    }
  }
  else console.log('No scheduler task found in templates setting.');

  callback();
};

