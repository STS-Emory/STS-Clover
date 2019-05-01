'use strict';

angular.module('system').controller('InsertModalController', ['$scope', '$uibModalInstance', 'data',
  function ($scope, $uibModalInstance, data) {
    $scope.data = data;

    $scope.okay = function(){
      $uibModalInstance.close(true);
    };

    $scope.cancel = function(){
      $uibModalInstance.close();
    };

    $scope.submit = function(){
      $uibModalInstance.close(
        {
          index: $scope.index,
          data: $scope.input
        }
      );
    };

    $scope.change = function(){
      $scope.index = $scope.data.options.indexOf($scope.location);
    };

  }
]);
