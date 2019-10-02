'use strict';

var fs = require('fs');

exports.LOGPATH = {
  DB: '/mnt/nfs/Db-Snapshots/db.log',
  DEFAULT: __dirname + '/logger.out'
};

// Helper functions
var formatLog = function(message){
  return new Date().toISOString() + '\t' + message + '\n';
};

// Module functions
exports.log = function(path, message, callback){
  fs.appendFile(path, formatLog(message), function(err){
    if(err){
      console.error('Failed to write log to' + path + '. Writing to ' + exports.LOGPATH.DEFAULT);
      exports.log(exports.LOGPATH.DEFAULT, message, callback);
    }
    else if(callback) callback(err);
  });
};
