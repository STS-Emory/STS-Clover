'use strict';

/**
 * Module dependencies
 */
module.exports = function (app) {

  var createModal = require('../controllers/sitask-create-modal.server.controller'),
    Users = require('../../../users/server/controllers/users.server.controller');

  app.route('/api/modal/getUser').post(Users.hasTechnicianPermission, createModal.getUser);
};
