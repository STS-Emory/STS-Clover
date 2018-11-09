'use strict';

// Setting up route
angular.module('customer').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Home state routing
    $stateProvider
      .state('customer', {
        abstract: true, url: '/customer',
        templateUrl: 'modules/customer/client/views/template.client.view.html'
      })
      .state('customer.home', {
        url: '/home',
        templateUrl: 'modules/customer/client/views/home/home.client.view.html'
      })
      .state('customer.walkin', {
        abstract: true, url: '/walkin',
        templateUrl: 'modules/customer/client/views/walkin/walkin-template.client.view.html'
      })
      .state('customer.invalid-user', {
        url: '/invalid-user',
        templateUrl: 'modules/customer/client/views/walkin/walkin-invalidUser.client.view.html'
      })
      .state('customer.walkin.netid', {
        url : '/netid',
        templateUrl: 'modules/customer/client/views/walkin/walkin-netid.client.view.html'
      })
      .state('customer.walkin.confirm-netid', {
        url : '/confirm-netid',
        templateUrl: 'modules/customer/client/views/walkin/walkin-netid-confirm.client.view.html'
      })
      .state('customer.walkin.confirm-reference', {
        url: '/confirm-reference',
        templateUrl: 'modules/customer/client/views/walkin/walkin-reference-confirm.client.view.html'
      })
      .state('customer.walkin.first-name', {
        url: '/first-name',
        templateUrl: 'modules/customer/client/views/walkin/walkin-firstName.client.view.html'
      })
      .state('customer.walkin.last-name', {
        url: '/last-name',
        templateUrl: 'modules/customer/client/views/walkin/walkin-lastName.client.view.html'
      })
      .state('customer.walkin.phone', {
        url: '/phone',
        templateUrl: 'modules/customer/client/views/walkin/walkin-phone.client.view.html'
      })
      .state('customer.walkin.location', {
        url: '/location',
        templateUrl: 'modules/customer/client/views/walkin/walkin-location.client.view.html'
      })
      .state('customer.walkin.device-category', {
        url: '/device-category',
        templateUrl: 'modules/customer/client/views/walkin/walkin-deviceCategories.client.view.html'
      })
      .state('customer.walkin.device-info', {
        url: '/device-info',
        templateUrl: 'modules/customer/client/views/walkin/walkin-deviceInfo.client.view.html'
      })
      .state('customer.walkin.other-device', {
        url: '/other-device',
        templateUrl: 'modules/customer/client/views/walkin/walkin-otherDevice.client.view.html'
      })
      .state('customer.walkin.problem', {
        url: '/problem',
        templateUrl: 'modules/customer/client/views/walkin/walkin-problem.client.view.html'
      })
      .state('customer.walkin.review', {
        url: '/review',
        templateUrl: 'modules/customer/client/views/walkin/walkin-review.client.view.html'
      })
      .state('customer.walkin-success', {
        url: '/walkin-success',
        templateUrl: 'modules/customer/client/views/walkin/walkin-success.client.view.html'
      });

    $urlRouterProvider.when('/', '/customer/home');
    $urlRouterProvider.when('/customer', '/customer/home');

    $urlRouterProvider.when('/customer/walkin', '/customer/walkin/netid');
  }
]);
