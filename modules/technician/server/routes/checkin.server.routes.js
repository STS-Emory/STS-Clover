'use strict';

module.exports = function (app) {
  // Root routing
  var system = require('../../../system/server/controllers/system.server.controller.js');
  var users = require('../../../users/server/controllers/users.server.controller.js');
  var walkin = require('../controllers/walkin.server.controller.js');
  var checkin = require('../controllers/checkin.server.controller.js');

  // Setting functions
  app.route('/api/technician/checkin/setting/transfer')
    .get(system.setting, checkin.getCheckinTransferSetting);

  app.route('/api/technician/checkin/setting/queue')
    .get(system.setting, checkin.getCheckinQueueSetting);
  
  // Creation functions
  app.route('/api/technician/checkin/hasTransferred/:walkinId')
    .get(users.hasTechnicianPermission, checkin.hasTransferred);
  
  app.route('/api/technician/checkin/transfer/:walkinId')
    .post(users.hasTechnicianPermission, system.setting, checkin.create);

  // Rendering functions
  app.route('/api/technician/checkin/view/:checkinId')
    .get(users.hasTechnicianPermission, checkin.view);

  // Searching function
  app.route('/api/technician/checkin/queue')
    .get(users.hasTechnicianPermission, checkin.queue);

  app.route('/api/technician/checkin/query/month')
    .get(users.hasTechnicianPermission, checkin.month);

  app.route('/api/technician/checkin/query/incomplete')
    .get(users.hasTechnicianPermission, checkin.incomplete);

  app.route('/api/technician/checkin/query')
    .post(users.hasTechnicianPermission, checkin.query);

  // Updating function
  app.route('/api/technician/checkin/update/:checkinId')
    .put(users.hasTechnicianPermission, checkin.update);

  app.route('/api/technician/checkin/logService/:checkinId')
    .post(users.hasTechnicianPermission, checkin.logService);

  app.route('/api/technician/checkin/changeStatus/:checkinId')
    .put(users.hasTechnicianPermission, checkin.changeStatus);

  app.route('/api/technician/checkin/checkout/:checkinId')
    .post(users.hasTechnicianPermission, system.setting, checkin.checkout);
  
  // Utility functions
  app.route('/api/technician/checkin/print/label/:checkinId')
    .post(users.hasTechnicianPermission, checkin.printLabel);

  // Admin overwrite functions
  app.route('/api/technician/checkin/servicenowSync/:checkinId')
    .post(users.hasAdminPermission, system.setting, checkin.syncTicket);

  app.param('walkinId', walkin.walkinById);
  app.param('checkinId', checkin.checkinById);
  app.param('username', users.userByUsername);
};
