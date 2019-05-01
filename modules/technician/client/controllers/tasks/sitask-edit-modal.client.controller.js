'use strict';

angular.module('system').controller('SITaskEditModalController', ['$scope', '$uibModalInstance', 'data', 'Authentication', 'ModalLauncher',
  function ($scope, $uibModalInstance, data, Authentication, ModalLauncher) {
    $scope.data = data; $scope.user = Authentication.getUser();
    
    // Modal functions
    $scope.cancel = function() {
      $uibModalInstance.close(false);
    };

    $scope.update = function() {
      console.log($scope.data);
      $uibModalInstance.close($scope.data.sitask);
    };

  }
]);
