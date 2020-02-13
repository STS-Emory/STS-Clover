'use strict';

// Setting up route
angular.module('technician').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Home state routing
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'modules/technician/client/views/authentication/login.client.view.html'
      })
      // Main views and functions
      .state('tech', {
        abstract: true, url: '/tech',
        templateUrl: 'modules/technician/client/views/panel/template.client.view.html'
      })
      .state('tech.home', {
        url: '/home',
        templateUrl: 'modules/technician/client/views/panel/home.client.view.html',
        data: { breadcrumb : 'Dashboard' }
      })
      // Tasks
      .state('tech.tasks', {
        url: '/tasks',
        templateUrl: 'modules/technician/client/views/tasks/task-center.client.view.html',
        data: { breadcrumb : 'Tasks Center' }
      })
      // Walk-in
      .state('tech.walkin', {
        abstract: true, url: '/walkin', template: '<ui-view>'
      })
      .state('tech.walkin.queue', {
        url: '/queue',
        templateUrl: 'modules/technician/client/views/walkin/walkin-queue.client.view.html',
        data: { breadcrumb : 'Walk-ins: Active Queue' }
      })
      .state('tech.walkin.list', {
        url: '/list',
        templateUrl: 'modules/technician/client/views/walkin/walkin-list.client.view.html',
        data: { breadcrumb : 'Walk-ins: All Walk-ins' }
      })
      .state('tech.walkin.transfer', {
        url: '/transfer/:walkinId',
        templateUrl: 'modules/technician/client/views/walkin/walkin-transfer.client.view.html',
        data: { breadcrumb : 'Walk-ins: Transfer to Check-in' }
      })
      // Check-in
      .state('tech.checkin', {
        abstract: true, url: '/checkin', template: '<ui-view>'
      })
      .state('tech.checkin.queue', {
        url: '/queue',
        templateUrl: 'modules/technician/client/views/checkin/checkin-queue.client.view.html',
        data: { breadcrumb : 'Check-ins: Active Queue' }
      })
      .state('tech.checkin.list', {
        url: '/list',
        templateUrl: 'modules/technician/client/views/checkin/checkin-list.client.view.html',
        data: { breadcrumb : 'Check-ins: Previous Repairs' }
      })
      // User
      .state('tech.user', {
        abstract: true, url: '/user', template: '<ui-view>'
      })
      .state('tech.user.password', {
        url: '/password',
        templateUrl: 'modules/technician/client/views/user/user-change-pwd.client.view.html',
        data: { breadcrumb : 'Change Password' }
      })
      .state('tech.user.list', {
        url: '/list',
        templateUrl: 'modules/technician/client/views/user/user-list.client.view.html',
        data: { breadcrumb : 'Search Users' }
      });

    $urlRouterProvider.when('/tech', '/tech/home');
  }
]);
