'use strict';

module.exports = function (app) {
  // Root routing
  var customer_walkin = require('../controllers/customer.server.controller.js');
  var users = require('../../../users/server/controllers/users.server.controller.js');
  var system = require('../../../system/server/controllers/system.server.controller.js');

  app.route('/api/customer/setting')
    .get(system.setting, customer_walkin.getCustomerWalkinSetting);

  app.route('/api/customer/referenceTicket/:username')
    .get(customer_walkin.getReferenceTickets);

  app.param('username', users.userByUsername);
};
