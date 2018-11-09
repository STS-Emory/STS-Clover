'use strict';

/**
 * Module dependencies
 */
var users = require('../../../users/server/controllers/users.server.controller'),
  chore = require('../controllers/chore.server.controller');

module.exports = function (app) {
  app.route('/api/tech/chore/create').post(users.hasTechnicianPermission, chore.create);
  app.route('/api/tech/chore/list').get(users.hasTechnicianPermission, chore.list);
  app.route('/api/tech/chore/complete/:choreId').post(users.hasTechnicianPermission, chore.completeChore);

  app.route('/api/tech/chore/query').post(users.hasTechnicianPermission, chore.query);

  app.param('choreId', chore.choreById);
};
