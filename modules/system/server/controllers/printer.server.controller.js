'use strict';

var
  sys = require('util'),
  path = require('path'),
  format = require('string-format'),
  exec = require('child_process').exec;

// Module variables
var path_print_script = __dirname + '/../scripts/printLabel.sh';

var runScript = function(cmd){
  exec(cmd, function(error, stdout, stderr){
    if(error){
      console.error('Printer error: ');
      console.error(error);
    }
    if(stderr){
      console.error('Printer error (Shell): ');
      console.error(stderr);
    }
  });
};

exports.printLabel = function(num, name, netid, time){
  var cmd = format('sh {} \'{}\' \'{}\' \'{}\'', path_print_script, name, netid, time);
  for(var i = 0; i < num; i++) runScript(cmd);
};
