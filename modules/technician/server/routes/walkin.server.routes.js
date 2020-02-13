'use strict';

module.exports = function (app) {
  // Root routing
  var system = require('../../../system/server/controllers/system.server.controller.js');
  var users = require('../../../users/server/controllers/users.server.controller.js');
  var walkin = require('../controllers/walkin.server.controller.js');

  // Setting functions
  app.route('/api/technician/walkin/setting')
    .get(system.setting, walkin.getWalkinSetting);

  // Creation functions
  app.route('/api/technician/walkin/create')
    .post(walkin.create);

  // Rendering functions
  app.route('/api/technician/walkin/view/:walkinId')
    .get(users.hasTechnicianPermission, walkin.view);

  app.route('/api/technician/walkin/queue')
    .get(users.hasTechnicianPermission, walkin.getQueue);

  // Searching function
  app.route('/api/technician/walkin/previous/:walkinId/:username')
    .get(users.hasTechnicianPermission, walkin.previous);

  app.route('/api/technician/walkin/query/today')
    .get(users.hasTechnicianPermission, walkin.today);

  app.route('/api/technician/walkin/query/month')
    .get(users.hasTechnicianPermission, walkin.month);

  app.route('/api/technician/walkin/query/unresolved')
    .get(users.hasTechnicianPermission, walkin.unresolved);

  app.route('/api/technician/walkin/query')
    .post(users.hasTechnicianPermission, walkin.query);

  // Updating functions
  app.route('/api/technician/walkin/update/:walkinId')
    .put(users.hasTechnicianPermission, walkin.update);
  
  app.route('/api/technician/walkin/beginService/:walkinId')
    .put(users.hasTechnicianPermission, walkin.beginService);

  app.route('/api/technician/walkin/willReturn/:walkinId')
    .put(users.hasTechnicianPermission, system.setting, walkin.willReturn);

  app.route('/api/technician/walkin/noshow/:walkinId')
    .put(users.hasTechnicianPermission, system.setting, walkin.noshow);

  app.route('/api/technician/walkin/notEligible/:walkinId')
    .put(users.hasTechnicianPermission, walkin.notEligible);

  app.route('/api/technician/walkin/duplicate/:walkinId')
    .post(users.hasTechnicianPermission, walkin.duplicate);

  app.route('/api/technician/walkin/reassign/:walkinId/:username')
    .post(users.hasTechnicianPermission, walkin.reassign);

  app.route('/api/technician/walkin/resolve/:walkinId')
    .put(users.hasTechnicianPermission, system.setting, walkin.resolve);

  // Utility functions
  app.route('/api/technician/walkin/print/label/:walkinId')
    .post(users.hasTechnicianPermission, walkin.printLabel);

  // Admin overwrite functions
  app.route('/api/technician/walkin/servicenowSync/:walkinId')
    .post(users.hasAdminPermission, system.setting, walkin.syncTicket);

  app.route('/api/technician/walkin/forward/:walkinId')
    .post(users.hasAdminPermission, walkin.forward);
  

  // Middlewares
  app.param('walkinId', walkin.walkinById);
  app.param('username', users.userByUsername);
};
