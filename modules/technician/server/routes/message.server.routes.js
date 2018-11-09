'use strict';

module.exports = function (app) {
  // Root routing
  var message = require('../controllers/message.server.controller.js');
  var users = require('../../../users/server/controllers/users.server.controller.js');

  app.route('/api/technician/message/create/announcement').post(users.hasTechnicianPermission, message.createAnnouncement);
  app.route('/api/technician/message/read').post(users.hasTechnicianPermission, message.markAsRead);

  app.route('/api/technician/message/get/announcements')
    .get(users.hasTechnicianPermission, message.getAnnouncements);

  app.param('to', users.userByUsername);
};
