'use strict';

module.exports = function(app) {
  var entries = require('../controllers/user-entries.server.controller');

  app.route('/userEntries').post(entries.create);

  app.route('/userEntry/:username')
    .get(entries.view).put(entries.update).delete(entries.delete);

  app.param('username', entries.entryByUsername);
};
