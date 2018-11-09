'use strict';

module.exports = function (app) {
  // Root routing
  var entry = require('../controllers/service-entry.server.controller.js');
  var users = require('../../../users/server/controllers/users.server.controller.js');

  app.route('/api/technician/service-entry/update')
    .put(users.hasTechnicianPermission, entry.update)
    .delete(users.hasTechnicianPermission, entry.remove);
};
