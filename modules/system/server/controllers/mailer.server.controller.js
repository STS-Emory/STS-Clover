'use strict';

var
  _ = require('lodash'),
  mongoose = require('mongoose'),
  nodemailer = require('nodemailer'),
  jsonfile = require('jsonfile'),
  smtpTransport = require('nodemailer-smtp-transport');

mongoose.Promise = global.Promise;

// Module variables
exports.transporter = null;

exports.WALKIN = 'Walk-in';
exports.CHECKIN = 'Check-in';

var template_directory = __dirname + '/../../../../public/static/templates/email';
exports.TEMPLATE = {
  DEFAULT: template_directory + '/DefaultTemplate.json',

  WI_SURVEY: template_directory + '/Survey_Walkin.json',

  CI_RECEIPT: template_directory + '/CheckinReceipt.json',
  CI_PICKUP: template_directory + '/PickupReceipt.json',
  CI_LOG: template_directory + '/ServiceLog.json',
  CI_SURVEY: template_directory + '/Survey_Checkin.json',

  PR_WORKSTATIONS: template_directory + '/Problem-Workstations.json'
};
exports.ATTACHMENT = {
  CI_LIABILITY: {
    filename: 'STS Check-in Receipt.pdf',
    path: template_directory +'/static/STS Check-in Receipt.pdf'
  }
};

// Initialization functions
exports.default = function(){
  var path = __dirname + '/../../../../config/credentials/EmailConfig.json';
  return exports.init(jsonfile.readFileSync(path));
};

exports.init = function(credential){
  exports.transporter = nodemailer.createTransport(smtpTransport(credential));
  return exports;
};

// Module functions
exports.send = function(email, subject, name, body, callback){
  jsonfile.readFile(exports.TEMPLATE.DEFAULT, function(err, template){
    if(err || !template) console.error(err);
    else{
      template.to = email; template.subject = subject;
      template.text = template.text.replace('<NAME>', name);
      template.html = template.html.replace('<NAME>', name);
      template.text = template.text.replace('<BODY>', body);
      template.html = template.html.replace('<BODY>', body);

      template.html = template.html.replace(/\n/g, '<br>');
      exports.transporter.sendMail(template, function(err, info){
        if(err || !info) return console.error(err);
        if(callback) callback(info);
      });
    }
  });
};

exports.sendCheckinReceipt = function(email, id, items, name, callback){
  jsonfile.readFile(exports.TEMPLATE.CI_RECEIPT, function(err, template) {
    if(err || !template) console.error(err);
    else{
      template.to = email; template.attachments = [exports.ATTACHMENT.CI_LIABILITY];

      var itemsString = items.join(', ');
      template.text = template.text.replace('<ID>', id);
      template.text = template.text.replace('<ITEMS>', itemsString);
      template.text = template.text.replace('<NAME>', name);

      template.html = template.html.replace('<ID>', id);
      template.html = template.html.replace('<ITEMS>', itemsString);
      template.html = template.html.replace('<NAME>', name);

      exports.transporter.sendMail(template, function(err, info){
        if(err || !info) return console.error(err);
        if(callback) callback(info);
      });
    }
  });
};

exports.sendPickupReceipt = function(email, id, items, name, callback){
  jsonfile.readFile(exports.TEMPLATE.CI_PICKUP, function(err, template) {
    if(err || !template) console.error(err);
    else{
      template.to = email;

      var itemsString = items.join(', ');
      template.text = template.text.replace('<ID>', id);
      template.text = template.text.replace('<ITEMS>', itemsString);
      template.text = template.text.replace('<NAME>', name);

      template.html = template.html.replace('<ID>', id);
      template.html = template.html.replace('<ITEMS>', itemsString);
      template.html = template.html.replace('<NAME>', name);

      exports.transporter.sendMail(template, function(err, info){
        if(err || !info) return console.error(err);
        if(callback) callback(info);
      });
    }
  });
};

exports.sendServiceLog = function(email, id, items, logs, name, callback) {
  jsonfile.readFile(exports.TEMPLATE.CI_LOG, function(err, template) {
    if (err || !template) console.error(err);
    else{
      template.to = email;

      var i, logString, itemsString = items.join(', ');
      for(i = 0, logString = ''; i < logs.length; i++)
        logString += '<li>' + logs[i].description + '</li>';
      template.html = template.html.replace('<ID>', id);
      template.html = template.html.replace('<NAME>', name);
      template.html = template.html.replace('<ITEMS>', itemsString);
      template.html = template.html.replace('<LOG>', logString);

      for(i = 0, logString = ''; i < logs.length; i++)
        logString += logs[i].description + '\n';
      template.text = template.text.replace('<ID>', id);
      template.text = template.text.replace('<NAME>', name);
      template.text = template.text.replace('<ITEMS>', itemsString);
      template.text = template.text.replace('<LOG>', logString);

      exports.transporter.sendMail(template, function(err, info){
        if(err || !info) return console.error(err);
        if(callback) callback(info);
      });
    }
  });
};

exports.sendSurvey = function(type, email, name, callback){
  var path;
  switch(type){
    case exports.WALKIN: path = exports.TEMPLATE.WI_SURVEY; break;
    case exports.CHECKIN: path = exports.TEMPLATE.CI_SURVEY; break;
    default: return console.error('Invalid type for survey email.');
  }
  jsonfile.readFile(path, function(err, template) {
    if (err || !template) console.error(err);
    else{
      template.to = email;
      template.html = template.html.replace('<NAME>', name);
      template.text = template.text.replace('<NAME>', name);
      exports.transporter.sendMail(template, function(err, info){
        if(err || !info) return console.error(err);
        if(callback) callback(info);
      });
    }
  });
};

// REST functions
exports.sendREST = function(req, res) {
  var content = req.body;

  jsonfile.readFile(exports.TEMPLATE.DEFAULT, function(err, template){
    if(err || !template){
      console.error(err);
      return res.sendStatus(500);
    }
    else{
      template.to = content.email; template.subject = content.subject;
      template.text = template.text.replace('<NAME>', content.name);
      template.html = template.html.replace('<NAME>', content.name);
      template.text = template.text.replace('<BODY>', content.body);
      template.html = template.html.replace('<BODY>', content.body);

      template.html = template.html.replace(/\n/g, '<br>');
      exports.transporter.sendMail(template, function(err, info){
        if(err || !info) {
          console.error(err);
          return res.sendStatus(500);
        }
        else res.sendStatus(200);
      });
    }
  });
};

exports.reportProblem_Workstations = function(req, res) {
  var config = req.body, user = req.user;

  jsonfile.readFile(exports.TEMPLATE.PR_WORKSTATIONS, function(err, template) {
    if (err || !template) {
      console.error(err);
      return res.sendStatus(500);
    }
    else {
      template.subject = template.subject.replace('<WSNUMBER>', config.WSnumber);
      template.text = template.text.replace('<DESCRIPTION>', config.description);
      template.text = template.text.replace('<FIXES>', config.fixes);
      template.text = template.text.replace('<NAME>', user.displayName);

      template.html = template.text;

      exports.transporter.sendMail(template, function(err, info){
        if(err || !info) {
          console.error(err);
          return res.sendStatus(500);
        }
        else res.sendStatus(200);
      });
    }
  });
};
