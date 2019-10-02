'use strict';

module.exports = function(app) {
  var entries = require('../controllers/user-entries.server.controller');
  var users = require('../../../users/server/controllers/users.server.controller.js');

  app.route('/userEntries').post(users.hasAdminPermission, entries.create);

  app.route('/userEntry/:username')
    .get(users.hasTechnicianPermission, entries.view)
    .put(users.hasTechnicianPermission, entries.update)
    .delete(users.hasTechnicianPermission, entries.delete);

  app.param('username', entries.entryByUsername);
};
