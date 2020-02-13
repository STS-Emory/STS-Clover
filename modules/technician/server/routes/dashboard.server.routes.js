'use strict';

module.exports = function (app) {
  // Root routing
  var users = require('../../../users/server/controllers/users.server.controller'),
    dashboard = require('../controllers/dashboard.server.controller.js');

  app.route('/api/technician/dashboard/stats').get(users.hasTechnicianPermission, dashboard.stats);
  app.route('/api/technician/dashboard/notification/counts').get(users.hasTechnicianPermission, dashboard.notificationCounts);

};
