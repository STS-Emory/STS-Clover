'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller.js');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.hasTechnicianPermission ,users.me);
  app.route('/api/users/password').post(users.hasTechnicianPermission, users.changePassword);
  app.route('/api/users/picture').post(users.hasTechnicianPermission, users.changeProfilePicture);

  app.route('/api/users/technician').get(users.hasTechnicianPermission, users.technician);
  app.route('/api/users/invalid').get(users.hasTechnicianPermission, users.invalid);
  app.route('/api/users/query').post(users.hasTechnicianPermission, users.query);
  app.route('/api/users/update/:username').put(users.hasTechnicianPermission, users.update);
  
  // User validation
  app.route('/api/users/validate/:username').get(users.validate);
};
