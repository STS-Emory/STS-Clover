'use strict';

var _ = require('lodash'),
  mongoose = require('mongoose'),
  Walkin = mongoose.model('Walkin'),
  SITask = mongoose.model('SITask'),
  Checkin = mongoose.model('Checkin');

mongoose.Promise = global.Promise;

var walkin_populate_options = [
  { path : 'user', model : 'User', select : 'firstName lastName displayName username phone location verified isWildcard' }
];

exports.getCustomerWalkinSetting = function(req, res) {
  var system = req.setting, setting = {};
  
  setting.location_options = system.location_options;
  setting.computer_options = system.computer_options;
  setting.device_options = system.device_options;

  res.json(setting);
};

exports.getReferenceTickets = function(req, res) {
  var user = req.profile;

  // Searching for 'Unresolved - Customer will return' walk-in tickets
  Walkin.find({ user : user, isActive : true, status : { $nin : ['Work in progress', 'In queue'] } }).sort('-created').limit(1)
    .populate(walkin_populate_options).exec(function(err, walkins) {
      if(err){ console.error(err); res.sendStatus(500); }
      else {
        var walkin = walkins[0];

        if(walkin && walkin.status === 'Unresolved - Customer will return')
          res.json({ found : true, type : 'walk-in', ticket : walkin });
        else {

          // Searching for 'Checkout pending' check-in tickets
          Checkin.find({ user : user, isActive : true, status : { $nin : ['Completed'] } })
            .sort('-created').limit(1).exec(function(err, checkins) {
              if(err){ console.error(err); res.sendStatus(500); }
              else {
                var checkin = checkins[0];

                if(checkin && checkin.status === 'Checkout pending')
                  res.json({ found : true, type : 'check-in', ticket : checkin });
                else {
                  var username = user.username;

                  SITask.find({ username : username, walkin : { $exists : false } })
                    .sort({ created : 1 }).exec(function(err, sitasks) {
                      if(err){ console.error(err); res.sendStatus(500); }

                      else if(sitasks && sitasks.length > 0)
                        res.json({ found : true, type : 'sitask', ticket : sitasks[0] });
                      else res.json({ found : false });
                    });
                }
              }
            });
        }
      }
    });
};
