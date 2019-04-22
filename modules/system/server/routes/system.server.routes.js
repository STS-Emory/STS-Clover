'use strict';

module.exports = function (app) {
  // Root routing
  var system = require('../controllers/system.server.controller.js');
  var users = require('../../../users/server/controllers/users.server.controller.js');

  app.route('/templates/setting')
    .get(users.hasAdminPermission, system.setting, system.getSetting)
    .put(users.hasAdminPermission, system.setting, system.update);

  app.route('/reboot')
  	.get(users.hasAdminPermission, system.reboot);
};
