'use strict';

// Setting up route
angular.module('technician.admin').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Home state routing
    $stateProvider
      // Main views and functions
      .state('admin', {
        abstract: true, url: '/admin',
        templateUrl: 'modules/technician/client/views/panel/template.client.view.html'
      })
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/technician/client/views/admin/admin-users.client.view.html',
        data: { breadcrumb: 'Register/Reset User' }
      })
      .state('admin.setting', {
        url: '/setting',
        templateUrl: 'modules/technician/client/views/admin/admin-setting.client.view.html',
        data: { breadcrumb: 'System Setting' }
      })
      .state('admin.import-netid', {
        url: '/import-netid',
        templateUrl: 'modules/technician/client/views/admin/admin-import-netid.client.view.html',
        data: { breadcrumb: 'Import NetID' }
      })
      .state('admin.stat', {
        abstract: true, url: '/stat', template: '<ui-view>'
      })
      .state('admin.stat.library-guidance', {
        url: '/library-guidance',
        templateUrl: 'modules/technician/client/views/admin/library-guidance-stat.client.view.html',
        data: { breadcrumb: 'Library Guidance Statistics' }
      });

    $urlRouterProvider.when('/admin', '/tech/home');
  }
]);
