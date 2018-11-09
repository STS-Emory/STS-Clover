'use strict';

angular.module('technician').controller('LibraryGuidanceController', ['$scope', '$http', '$timeout',
  function ($scope, $http, $timeout) {
    $scope.logLibraryGuidance = function(type){
      $http.post('/api/tech/library-guidance/log', { task : type })
        .success(function(){ $scope.success = true; })
        .error(function(){ $scope.error = true; });
      $timeout(function(){ $scope.error = $scope.success = undefined; }, 3000);
    };
  }
]);
