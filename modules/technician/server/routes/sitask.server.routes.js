'use strict';

/**
 * Module dependencies
 */
var users = require('../../../users/server/controllers/users.server.controller'),
  sitask = require('../controllers/sitask.server.controller');

module.exports = function (app) {
  app.route('/api/tech/sitask/create').post(users.hasTechnicianPermission, sitask.create);
  app.route('/api/tech/sitask/list').get(users.hasTechnicianPermission, sitask.list);

  app.route('/api/tech/sitask/view/:sitaskId').get(users.hasTechnicianPermission, sitask.view);
  app.route('/api/tech/sitask/update/:sitaskId').post(users.hasTechnicianPermission, sitask.update);

  app.route('/api/tech/sitask/fetch/:username').get(sitask.sitaskByUsername);
  app.route('/api/tech/sitask/query').post(users.hasTechnicianPermission, sitask.query);

  app.param('sitaskId', sitask.sitaskById);
};
