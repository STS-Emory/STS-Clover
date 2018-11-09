'use strict';

/**
 * Module dependencies
 */
var users = require('../controllers/users.server.controller'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  app.route('/api/auth/signin').post(users.signin);
  app.route('/api/auth/signout').get(users.signout);

  app.route('/api/auth/registerUser').post(users.hasAdminPermission, admin.registerUser);
  app.route('/api/auth/resetPwd/:username').put(users.hasAdminPermission, admin.resetPwd);
  app.route('/api/auth/removeTechnician/:username').put(users.hasAdminPermission, admin.removeTechnicianRole);
  
  app.param('username', users.userByUsername);
};
