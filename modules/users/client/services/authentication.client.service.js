'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = { user: $window.user || '' };

    auth.getUser = function() {
      return this.user;
    };

    auth.isLogin = function() {
      return this.user !== undefined && this.user !== '';
    };

    auth.hasAdminPerm = function() {
      return this.isLogin() && this.user.roles.indexOf('admin') >= 0;
    };

    auth.hasTechnicianPerm = function(){
      return this.isLogin() && (this.hasAdminPerm() || this.user.roles.indexOf('technician') >= 0);
    };

    return auth;
  }
]);
