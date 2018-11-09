'use strict';

var fs = require('fs'),
  _ = require('lodash'),
  async = require('async'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Walkin = mongoose.model('Walkin'),
  Checkin = mongoose.model('Checkin'),
  ServiceEntry = mongoose.model('ServiceEntry'),
  mailer = require('../../../system/server/controllers/mailer.server.controller.js'),
  sn = require('../../../system/server/controllers/service-now.server.controller.js'),
  printer = require('../../../system/server/controllers/printer.server.controller.js');

var popOpt = [
  { path : 'user', model : 'User', select : 'firstName lastName displayName username phone location verified isWildcard' },
  { path : 'walkin', model : 'Walkin', select : 'description resoluteTechnician deviceCategory deviceInfo otherDevice resolutionTime' },
  { path : 'serviceLog', model : 'ServiceEntry', select : 'type description createdBy createdAt' },
  { path : 'completionTechnician', model : 'User', select : 'username displayName' },
  { path : 'verificationTechnician', model : 'User', select : 'username displayName' },
  { path : 'checkoutTechnician', model : 'User', select : 'username displayName' }
];

var popOpt_entry = [
    { path : 'serviceLog.createdBy', model : 'User', select : 'username displayName' }
  ],
  popOpt_walkin = [
    { path : 'walkin.resoluteTechnician', model : 'User', select : 'username displayName' }
  ];

var workflow_templates_path = 'config/templates/checkin/workflow_templates.json',
  workflow_templates = JSON.parse(fs.readFileSync(workflow_templates_path, 'utf8'));

mongoose.Promise = global.Promise;

exports.getCheckinTransferSetting = function(req, res) {
  var system = req.setting, setting = {};
  
  setting.computer_os_editions = system.computer_os_editions;
  setting.checkin_items = system.checkin_items;

  res.json(setting);
};

exports.getCheckinQueueSetting = function(req, res) {
  var system = req.setting, setting = {};

  setting.checkin_items = system.checkin_items;
  setting.templates = workflow_templates;
  
  res.json(setting);
};

exports.view = function(req, res) {
  res.json(req.checkin);
};

exports.hasTransferred = function(req, res) {
  var walkin = req.walkin;

  if(walkin.status != 'Check-in') {
    Checkin.find({ walkin : walkin._id }).count(function(err, count) {
      if(err) { console.error(err); return res.sendStatus(500); }
      else res.json(count > 0);
    });
  }
  else res.json(true);
};

exports.create = function(req, res) {
  var setting = req.setting, user = req.user, walkin = req.walkin, checkin = new Checkin(req.body);
  
  // Resolve walk-in
  walkin.status = 'Completed';
  walkin.resolutionType = 'Check-in';
  walkin.resolution = 'Ticket has been transferred into a check-in instance.';

  if(!walkin.resoluteTechnician || !walkin.resolutionTime)
    walkin = _.extend(walkin , { resoluteTechnician : user, resolutionTime : Date.now() });

  walkin.save(function(err){ 
    if(err) { console.error(err); return res.sendStatus(500); }
    else {
      // Create Check-in
      checkin.user = walkin.user;
      checkin.walkin = walkin;
      checkin.save(function(err, checkin) {
        if(err) { console.error(err); return res.sendStatus(500); }
        else {
          // Print labels for every devices 
          printer.printLabel(checkin.itemReceived.length,
            checkin.user.displayName, checkin.user.username, checkin.created.toDateString());

          // Send Check-in receipt email
          mailer.sendCheckinReceipt(checkin.user.username+'@emory.edu',
            checkin._id, checkin.itemReceived, checkin.user.displayName,
            function(){ checkin.receiptEmailSent = true; checkin.save(); });

          res.json(checkin);
        }
      });
      
      // Sync ticket to SN
      if(setting.servicenow_liveSync) {
        sn.syncIncident(sn.CREATE, sn.WALKIN, walkin, function(response){
          if(walkin.forward) sn.forwardIncident(sn.CREATE, sn.WALKIN, response);
        });
      }
    }
  });
};

exports.update = function(req, res) {
  var checkin = req.checkin, updated = req.body;
  delete updated.__v;

  checkin = _.extend(checkin, updated);
  checkin.save(function(err, checkin) {
    if(err) { console.error(err); return res.sendStatus(500); }
    else res.json(checkin);
  });
};

exports.changeStatus = function(req, res) {
  var checkin = req.checkin, status = req.body.status;
  var user = req.user, change = { status : status };
  
  switch (status) {
    case 'Work in progress': case 'User action pending':
      break;
    case 'Verification pending':
      change.completionTechnician = user;
      change.completionTime = Date.now();
      break;
    case 'Checkout pending':
      change.verificationTechnician = user;
      change.verificationTime = Date.now();
      break;
    default:
      return res.status(500).send('Invalid status.');
  }

  checkin = _.extend(checkin, change);
  checkin.save(function(err, checkin) {
    if(err) { console.error(err); return res.sendStatus(500); }
    else {
      // Send email for pick-up
      if(status === 'Checkout pending' && !checkin.user.isWildcard)
        mailer.sendPickupReceipt(checkin.user.username+'@emory.edu',
          checkin._id, checkin.itemReceived, checkin.user.displayName,
          function(){ checkin.pickupEmailSent = true; checkin.save(); });

      res.json(checkin);
    }
  });
};

exports.checkout = function(req, res) {
  var checkin = _.extend(req.checkin, {
    status : 'Completed',
    checkoutTime : Date.now(),
    checkoutTechnician : req.user
  });
  
  checkin.save(function(err, checkin) {
    if(err) { console.error(err); return res.sendStatus(500); }
    else{
      // Send email for service detail
      if(!checkin.user.isWildcard)
        mailer.sendServiceLog(checkin.user.username+'@emory.edu',
          checkin._id, checkin.itemReceived, checkin.serviceLog, checkin.user.displayName,
        function(){ checkin.logEmailSent = true; checkin.save(); });

      // Sync with SN
      sn.syncIncident(sn.CREATE, sn.CHECKIN, checkin);

      res.json(checkin);
    }
  });
};

exports.queue = function(req, res) {
  var working = [], pending = [];

  async.waterfall([
    function(callback){
      Checkin.find({ status : { $ne : 'Completed' }, isActive : true })
        .sort('created').populate(popOpt).exec(callback);
    },
    function(checkins, callback) {
      Walkin.populate(checkins, popOpt_walkin, callback);
    },
    function(checkins, callback) {
      ServiceEntry.populate(checkins, popOpt_entry, callback);
    }
  ], function(err, checkins){
    if(err) { console.error(err); return res.sendStatus(500); }
    else {
      for (var i in checkins) {
        switch (checkins[i].status) {
          case 'Work in progress': case 'Verification pending':
            working.push(checkins[i]); break;
          default: pending.push(checkins[i]);
        }
      }
      res.json({ working: working, pending: pending });
    }
  });
};

exports.logService = function(req, res) {
  var checkin = req.checkin, entry = new ServiceEntry(req.body);
  entry.createdBy = req.user;

  entry.save(function(err, entry) {
    if(err) { console.error(err); return res.sendStatus(500); }
    else {
      checkin.serviceLog.push(entry);
      checkin.save(function(err) {
        if(err) { console.error(err); return res.sendStatus(500); }
        else res.json(entry);
      });
    }
  });
};

/*----- Other functions -----*/
exports.printLabel = function(req, res) {
  var checkin = req.checkin;
  printer.printLabel(1, checkin.user.displayName, checkin.user.username, checkin.created.toDateString());
  res.sendStatus(200);
};

exports.syncTicket = function(req, res) {
  var setting = req.setting, checkin = req.checkin;
  if(setting.servicenow_liveSync) {
    var action = checkin.snValue ? sn.UPDATE : sn.CREATE;

    sn.syncIncident(action, sn.CHECKIN, checkin, function(checkin){
      if(checkin) res.json(checkin);
      else res.sendStatus(500);
    });
  }
  else res.status(400).send('ServiceNow Sync is disabled.');
};

/*----- Instance queries -----*/
exports.query = function(req, res) {
  var query = req.body;

  if(query.username || query.displayName) {
    User.find(query).select('_id').exec(function(err, ids) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }

      ids = ids.map(function(obj){ return obj._id; });
      Checkin.find({ user : { $in : ids } })
        .select('_id user deviceManufacturer deviceModel status created completionTime checkoutTime')
        .populate([{ path : 'user', model : 'User', select : 'displayName username' }])
        .sort('created').exec(function(err, checkins) {
          if(err) {
            console.error(err);
            return res.sendStatus(500);
          }
          else res.json(checkins);
        });
    });
  }
  else {
    Checkin.find(query)
      .select('_id user deviceManufacturer deviceModel status created completionTime checkoutTime')
      .populate([{ path : 'user', model : 'User', select : 'displayName username' }])
      .sort('created').exec(function(err, checkins) {
        if(err) {
          console.error(err);
          return res.sendStatus(500);
        }
        else res.json(checkins);
      });
  }
};

exports.incomplete = function(req, res) {
  Checkin.find({ isActive : true, status : { $ne : 'Completed' } })
    .select('_id user deviceManufacturer deviceModel status created completionTime checkoutTime')
    .populate([{ path : 'user', model : 'User', select : 'displayName username' }])
    .sort('created').exec(function(err, checkins) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      else res.json(checkins);
    });
};

exports.month = function(req, res) {
  var currentMonth = new Date(Date.now()); currentMonth.setDate(1); currentMonth.setHours(0);
  Checkin.find({ isActive : true, $or : [ { completionTime : { $gte : currentMonth } }, { created : { $gte : currentMonth } }] })
      .select('_id user deviceManufacturer deviceModel status created completionTime checkoutTime')
    .populate([{ path : 'user', model : 'User', select : 'displayName username' }])
    .sort('created').exec(function(err, checkins) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      else res.json(checkins);
    });
};

/*----- Instance middlewares -----*/
exports.checkinById = function(req, res, next, id) {
  async.waterfall([
    function(callback) {
      Checkin.findOne({ _id : id }).populate(popOpt).exec(callback);
    },
    function(checkin, callback) {
      Walkin.populate(checkin, popOpt_walkin, callback);
    },
    function(checkin, callback) {
      ServiceEntry.populate(checkin, popOpt_entry, callback);
    }
  ], function(err, checkin){ req.checkin = checkin; next(); });
};
