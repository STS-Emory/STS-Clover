'use strict';

module.exports = function (app) {
  // Root routing
  var email = require('../controllers/mailer.server.controller.js').default();
  var users = require('../../../users/server/controllers/users.server.controller.js');
  
  app.route('/api/technician/email/send').post(users.hasTechnicianPermission, email.sendREST);
  app.route('/api/technician/email/report/problem').post(users.hasTechnicianPermission, email.reportProblem);
};
