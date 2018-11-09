'use strict';

var mongoose = require('mongoose'),
  Walkin = mongoose.model('Walkin'),
  sn = require('./service-now.server.controller.js');

mongoose.Promise = global.Promise;

var popOpt_walkin = [
  { path : 'user', model : 'User', select : 'firstName lastName displayName username phone location verified isWildcard' },
  { path : 'lastUpdateTechnician', model : 'User', select : 'displayName username' },
  { path : 'serviceTechnician', model : 'User', select : 'displayName username' },
  { path : 'resoluteTechnician', model : 'User', select : 'displayName username' }
];

// For fixing wrong group assignment of walk-ins from 2016/05/05 - 2016/08/02.
exports.updateGroupAssignment = function(req, res) {
  var start = new Date('2016/05/05'), end = new Date('2016/08/03');
    
  Walkin.find({ status : 'Completed', isActive : true, snValue : { $ne : '' },
    updated : { $gt : start, $lt : end } }).sort('updated').populate(popOpt_walkin)
    .exec(function(err, walkins){
      if(err) { console.error(err); return res.sendStatus(500); }
      else {  
        walkins = walkins.slice(0, 1);
          
        sn.createSoapClient(function(client) {
          sn.syncTicketAux(client, 0, sn.UPDATE, sn.WALKIN, walkins);
        });
      }
    });
};
