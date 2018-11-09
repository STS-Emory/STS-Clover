'use strict';

module.exports = function (app) {
  // Root routing
  var email = require('../controllers/mailer.server.controller.js').default();
  
  app.route('/api/technician/email/send').post(email.sendREST);
  app.route('/api/technician/email/report/problem/workstations').post(email.reportProblem_Workstations);
};
