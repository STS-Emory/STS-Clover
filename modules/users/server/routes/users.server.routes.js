'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller.js');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);

  app.route('/api/users/technician').get(users.technician);
  app.route('/api/users/invalid').get(users.invalid);
  app.route('/api/users/query').post(users.query);
  app.route('/api/users/update/:username').put(users.update);
  
  // User validation
  app.route('/api/users/validate/:username').get(users.validate);
};
