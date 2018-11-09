'use strict';

angular.module('customer').controller('CustomerWalkinController', ['$rootScope', '$scope', '$http',
  function ($rootScope, $scope, $http) {
    $scope.walkin = {};
    $scope.status = {};
    $scope.reference = { type : '', ticket : {} };


    $scope.init = function() {
      $http.get('/api/customer/setting')
        .error(function() { alert('Request failed. Please check console for error.'); })
        .success(function(setting) { $scope.setting = setting; });
    };
  }
]);
