'use strict';

module.exports = function (app) {
  var misc = require('../controllers/misc.server.controller.js');

  app.route('/api/misc/updateGroupAssignment').post(misc.updateGroupAssignment);
      
};