'use strict';

var fs = require('fs'),
  _ = require('lodash'),
  async = require('async'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Walkin = mongoose.model('Walkin'),
  SITask = mongoose.model('SITask'),
  mailer = require('../../../system/server/controllers/mailer.server.controller.js'),
  sn = require('../../../system/server/controllers/service-now.server.controller.js'),
  printer = require('../../../system/server/controllers/printer.server.controller.js');

var populate_options = [
  { path : 'user', model : 'User', select : 'firstName lastName displayName username phone location verified isWildcard' },
  { path : 'lastUpdateTechnician', model : 'User', select : 'firstName lastName displayName username' },
  { path : 'serviceTechnician', model : 'User', select : 'firstName lastName displayName username' },
  { path : 'resoluteTechnician', model : 'User', select : 'firstName lastName displayName username' }
];

var resolution_templates_path = 'config/templates/walkin/resolution_templates.json',
  resolution_templates = JSON.parse(fs.readFileSync(resolution_templates_path, 'utf8'));

mongoose.Promise = global.Promise;

/*----- Getters -----*/
exports.getWalkinSetting = function(req, res){
  var system = req.setting, setting = {};

  setting.location_options = system.location_options; setting.resolutions_options = resolution_templates;
  setting.device_options = system.device_options; setting.computer_options = system.computer_options;

  res.json(setting);
};

exports.view = function(req, res) {
  res.json(req.walkin);
};

exports.countWaiting = function(req, res, next) {
  Walkin.count({ isActive : true, liabilityAgreement : true, status : 'In queue' },
    function(err, count) {
      if(err) console.error(err);
      req.walkinCount = count;
      next();
    });
};

exports.getQueue = function(req, res) {
  var today = new Date(Date.now()); today.setHours(0);

  Walkin.find({ isActive : true, liabilityAgreement : true,
    $or: [{ status: { $in : ['In queue', 'Work in progress', 'Duplicate', 'House call pending'] } },
      { status : 'Completed', created : { $gte: today } } ] })
    .sort('created').populate(populate_options).exec(function(err, walkins) {
      if(err){ console.error(err); res.sendStatus(500); }
      else {
        var queue = [], housecalls = [];
        var count = 0, sumWaitTime = 0, sumWorkTime = 0;

        for(var i in walkins) {
          switch (walkins[i].status) {
            case 'In queue' : case 'Work in progress': case 'Duplicate':
              queue.push(walkins[i]);
              break;

            case 'House call pending':
              housecalls.push(walkins[i]);
              break;

            case 'Completed':
              sumWaitTime += walkins[i].serviceStartTime.getTime() - walkins[i].created.getTime();
              sumWorkTime += walkins[i].resolutionTime.getTime() - walkins[i].serviceStartTime.getTime();
              count++; break;
          }
        }
        queue = queue.concat(housecalls);
        var avgWaitTime = count !== 0? Math.round(sumWaitTime / 60000.0 / count * 100) / 100.0 : 0,
          avgWorkTime = count !== 0? Math.round(sumWorkTime / 60000.0 / count * 100) / 100.0 : 0;

        res.json({ walkins : queue, avgWaitTime : avgWaitTime, avgWorkTime : avgWorkTime });
      }
    });
};

exports.previous = function(req, res) {
  var walkin = req.walkin, user = req.profile;
  Walkin.find({ user : user._id, created : { $lt: walkin.created } })
    .select('_id deviceCategory deviceInfo status resolutionType created')
    .sort('created').exec(function(err, previous) {
      if(err) { console.error(err); return res.sendStatus(500); }
      else res.json(previous);
    });
};

/*----- Instance queries -----*/
exports.query = function(req, res) {
  var query = req.body;

  if(query.username || query.displayName) {
    User.find(query).select('_id').exec(function(err, ids) {
      if(err){ console.error(err); return res.sendStatus(500); }

      ids = ids.map(function(obj){ return obj._id; });
      Walkin.find({ user : { $in : ids } })
        .select('_id user deviceCategory deviceInfo otherDevice status resolutionType created resolutionTime')
        .populate([{ path : 'user', model : 'User', select : 'displayName username' }])
        .sort('created').exec(function(err, walkins) {
          if(err) {
            console.error(err);
            return res.sendStatus(500);
          }
          else res.json(walkins);
        });
    });
  }
  else {
    Walkin.find(query)
      .select('_id user deviceCategory deviceInfo otherDevice status resolutionType created resolutionTime')
      .populate([{ path : 'user', model : 'User', select : 'displayName username' }])
      .sort('created').exec(function(err, walkins) {
        if(err) {
          console.error(err);
          return res.sendStatus(500);
        }
        else res.json(walkins);
      });
  }
};

exports.unresolved = function(req, res) {
  var today = new Date(Date.now()); today.setHours(0);
  Walkin.find({ isActive : true, liabilityAgreement : true,
    $or : [
      { status: { $in : ['In queue', 'Work in progress', 'House call pending'] } },
      { status : { $in : ['Unresolved', 'Unresolved - Customer will return', 'Unresolved - Not eligible', 'Unresolved - No show'] }, created : { $gte : today } } ] }
  ).select('_id user deviceCategory deviceInfo otherDevice status resolutionType created resolutionTime')
    .populate([{ path : 'user', model : 'User', select : 'displayName username' }])
    .sort('created').exec(function(err, walkins) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      else res.json(walkins);
    });
};

exports.today = function(req, res) {
  var today = new Date(Date.now()); today.setHours(0);
  Walkin.find({ isActive : true, liabilityAgreement : true, $or : [ { created : { $gte : today } }, { resolutionTime : { $gte : today } }] })
    .select('_id user deviceCategory deviceInfo otherDevice status resolutionType created resolutionTime')
    .populate([{ path : 'user', model : 'User', select : 'displayName username' }])
    .sort('created').exec(function(err, walkins) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      else res.json(walkins);
    });
};

exports.month = function(req, res) {
  var currentMonth = new Date(Date.now()); currentMonth.setDate(1); currentMonth.setHours(0);
  Walkin.find({ isActive : true, liabilityAgreement : true,
    $or : [{ created : { $gte : currentMonth } }, { resolutionTime : { $gte : currentMonth } }] })
    .select('_id user deviceCategory deviceInfo otherDevice status resolutionType created resolutionTime')
    .populate([{ path : 'user', model : 'User', select : 'displayName username' }])
    .sort('created').exec(function(err, walkins) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      else res.json(walkins);
    });
};

/*----- Instance functions -----*/
exports.create = function(req, res) {
  var need2CreateUser = req.body.need2CreateUser, walkin = req.body;
  walkin.user.lastVisit = Date.now();

  async.waterfall([
    // Get+Update/Save user
    function(callback) {
      User.findOne({ username : walkin.user.username }, function (err, user) {
        if(err){ console.error(err); callback(err);}
        else {
          user = user? user = _.extend(user, walkin.user) : new User(walkin.user);
          user.save(function(err){ walkin.user = user; callback(err); });
        }
      });
    },

    // Create walk-in
    function(callback) {
      delete walkin.need2CreateUser;

      Walkin.findOne({ user : walkin.user._id, created : { $gte : new Date(Date.now()-30000) } })
        .populate(populate_options).exec(function(err, created_ticket) {
          if(created_ticket) walkin = _.extend(created_ticket, walkin);
          else walkin = new Walkin(walkin);

          walkin.save(function(err){ callback(err, walkin); });
        });
    }],
    
    function(err, walkin){
      if(err){ console.error(err); return res.sendStatus(500); }
      else res.json(walkin);
    });
};

exports.duplicate = function(req, res) {
  var original = req.walkin,
    duplicate = new Walkin({
      status: 'Duplicate',
      user: original.user,
      lastUpdateTechnician: req.user,
      deviceInfo: original.deviceInfo,
      description: original.description,
      otherDevice: original.otherDevice,
      deviceCategory: original.deviceCategory,
      liabilityAgreement: original.liabilityAgreement,
      workNote: 'This is a duplicate ticket for walk-in id: ' + original._id + '.'
    });

  duplicate.save(function(err) {
    if(err) { console.error(err); return res.sendStatus(500); }
    else {
      console.log('Duplicate Walk-in ID: ' + original._id + ' -> ' + duplicate._id);
      res.json(duplicate);
    }
  });
};

exports.reassign = function(req, res) {
  var walkin = req.walkin; var to = req.profile, from = req.body;

  if(!to) {
    to = req.netid;
    User.findOne({ username : from.username }, function(err, user) {
      if(err) { console.error(err); return res.sendStatus(500); }
      user.username = req.netid;
      user.save(function(err){
        if(err) { console.error(err); return res.sendStatus(500); }

        walkin.user = user;
        walkin.save(function(err) {
          if(err) { console.error(err); return res.sendStatus(500); }
          res.json(walkin);
        });
      });
    });
  }
  else if(!to.isActive)
    return res.status(500).send('User is not active. User does not have access to service.');
  else {
    walkin.user = to;
    walkin.save(function(err) {
      if(err) { console.error(err); return res.sendStatus(500); }
      res.json(walkin);
    });
  }
};

exports.update = function(req, res) {
  var original = req.walkin, updated = req.body;
  var o_user = original.user, u_user = updated.user;

  // Check if user information changed
  if(o_user.displayName !== u_user.displayName ||
    o_user.phone !== u_user.phone ||
    o_user.location !== u_user.location ||
    o_user.verified !== u_user.verified) {

    o_user = _.extend(o_user, u_user);
    o_user.save(function(err) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
    });
  }

  // Update walk-in information
  original = _.extend(original, updated);
  original.lastUpdateTechnician = req.user;

  console.log('Update Walk-in ID: ' + original._id);
  original.save(function(err) {
    if(err) { console.error(err); return res.sendStatus(500); }
    else {
      if(original.snValue)
        sn.syncIncident(sn.UPDATE, sn.WALKIN, original);

      res.json(original);
    }
  });
};

exports.syncTicket = function(req, res) {
  var setting = req.setting, walkin = req.walkin;
  if(setting.servicenow_liveSync) {
    var action = walkin.snValue? sn.UPDATE : sn.CREATE;

    sn.syncIncident(action, sn.WALKIN, walkin, function(walkin){
      if(walkin) res.json(walkin);
      else res.sendStatus(500);
    });
  }
  else res.status(400).send('ServiceNow Sync is disabled.');
};

/*----- Instance status updates -----*/
exports.willReturn = function(req, res) {
  var setting = req.setting, walkin = req.walkin, updated = req.body.walkin;

  walkin = _.extend(walkin, updated);
  walkin = _.extend(walkin, {
    resoluteTechnician : req.user,
    lastUpdateTechnician: req.user,
    status : 'Unresolved - Customer will return',
    resolution: 'Customer will return. See work note for current status.'
  });
  if(!walkin.serviceTechnician || !walkin.serviceStartTime) {
    walkin.serviceTechnician = req.user; walkin.serviceStartTime = Date.now();
  }
  if(!walkin.resolutionTime) walkin.resolutionTime = Date.now();

  console.log('Set Will Return Walk-in ID: ' + walkin._id);
  walkin.save(function(err) {
    if(err) { console.error(err); return res.sendStatus(500); }
    else {
      if(setting.servicenow_liveSync && walkin.user.verified)
        sn.syncIncident(sn.CREATE, sn.WALKIN, walkin);
      else if(!walkin.user.verified)
        mailer.send('michael.buchmann@emory.edu', 'Clover: Unverified NetID ' + walkin.user.username, 'Michael',
          'Important: Please verify NetID ' + walkin.user.username + ' (' + walkin.user.displayName + ').');
      res.sendStatus(200);
    }
  });
};

exports.noshow = function(req, res) {
  var setting = req.setting, walkin = req.walkin, updated = req.body.walkin;

  walkin = _.extend(walkin, updated);
  walkin = _.extend(walkin, {
    resoluteTechnician : req.user,
    lastUpdateTechnician: req.user,
    status : 'Unresolved - No show', resolution: 'Customer no show.'
  });
  if(!walkin.serviceTechnician || !walkin.serviceStartTime) {
    walkin.serviceTechnician = req.user; walkin.serviceStartTime = Date.now();
  }
  if(!walkin.resolutionTime) walkin.resolutionTime = Date.now();

  console.log('Set No Show Walk-in ID: ' + walkin._id);
  walkin.save(function(err) {
    if(err) { console.error(err); return res.sendStatus(500); }
    else {
      if(setting.servicenow_liveSync && walkin.user.verified)
        sn.syncIncident(sn.CREATE, sn.WALKIN, walkin);
      else if(!walkin.user.verified)
        mailer.send('michael.buchmann@emory.edu', 'Clover: Unverified NetID ' + walkin.user.username, 'Michael',
          'Important: Please verify NetID ' + walkin.user.username + ' (' + walkin.user.displayName + ').');
      res.sendStatus(200);
    }
  });
};

exports.notEligible = function(req, res) {
  var walkin = req.walkin;

  walkin = _.extend(walkin, {
    resoluteTechnician : req.user,
    lastUpdateTechnician: req.user,
    status : 'Unresolved - Not eligible', 
    resolution: 'Customer is not eligible for service.'
  });
  if(!walkin.serviceTechnician || !walkin.serviceStartTime) {
    walkin.serviceTechnician = req.user; walkin.serviceStartTime = Date.now();
  }
  if(!walkin.resolutionTime) walkin.resolutionTime = Date.now();

  walkin.save(function(err){
    if(err) { console.error(err); return res.sendStatus(500); }
    else {
      walkin.user = _.extend(walkin.user, {
        isActive : false, verified : true
      });
      walkin.user.save(function(err){
        if(err) { console.error(err); return res.sendStatus(500); }
        else res.sendStatus(200);
      });
    }
  });
};

exports.beginService = function(req, res) {
  var walkin = req.walkin;

  walkin = _.extend(walkin, {
    status: 'Work in progress',
    lastUpdateTechnician: req.user,
    serviceTechnician: req.user,
    serviceStartTime: Date.now()
  });

  console.log('Begin Service Walk-in ID: ' + walkin._id);
  walkin.save(function(err, walkin) {
    if(err) {
      console.error(err);
      return res.sendStatus(500);
    }
    else res.json(walkin);
  });
};

exports.resolve = function(req, res) {
  var setting = req.setting, walkin = req.walkin, resolved = req.body;

  resolved = _.extend(resolved, {
    status: 'Completed',
    resolutionTime: Date.now(),
    resoluteTechnician: req.user,
    lastUpdateTechnician: req.user
  });
  walkin = _.extend(walkin, resolved);

  console.log('Resolved Walk-in ID: ' + walkin._id);
  walkin.save(function(err) {
    if(err) { console.error(err); res.sendStatus(500); }
    else {
      if(setting.servicenow_liveSync && walkin.user.verified) {
        sn.syncIncident(sn.CREATE, sn.WALKIN, walkin, function(response){
          if(walkin.forward) sn.forwardIncident(sn.CREATE, sn.WALKIN, response);
        });
      }
      else if(!walkin.user.verified)
        mailer.send('michael.buchmann@emory.edu', 'Clover: Unverified NetID ' + walkin.user.username, 'Michael',
          'Important: Please verify NetID ' + walkin.user.username + ' (' + walkin.user.displayName + ').');

      if(walkin.sitask) {
        console.log('Resolved STS task ID: ' + walkin.sitask._id);
        SITask.findOneAndUpdate({ _id : walkin.sitask._id }, { walkin : walkin._id },
          function(err) {
            if(err) { console.error(err); res.sendStatus(500); }
            else res.sendStatus(200);
          });
      }
      else res.sendStatus(200);
    }
  });
};

exports.forward = function(req, res) {
  var walkin = req.walkin;
  walkin = _.extend(walkin, { forward: true });

  console.log('Forward Walk-in ID: ' + walkin._id);
  walkin.save(function(err) {
    if(err) { console.error(err); return res.sendStatus(500);}
    else {
      sn.forwardIncident(sn.CREATE, sn.WALKIN, walkin,
        function(walkin){ res.json(walkin); });
    }
  });
};

/*----- Other functions -----*/
exports.printLabel = function(req, res) {
  var walkin = req.walkin;
  printer.printLabel(1, walkin.user.displayName, walkin.user.username, walkin.created.toDateString());
  res.sendStatus(200);
};

/*----- Instance middlewares -----*/
exports.walkinById = function(req, res, next, id) {
  Walkin.findOne({ _id : id }).populate(populate_options)
    .exec(function(err, walkin) {
      if(err) console.error(err);
      else req.walkin = walkin;

      next();
    });
};
