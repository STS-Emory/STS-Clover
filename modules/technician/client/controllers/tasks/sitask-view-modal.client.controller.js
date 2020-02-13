'use strict';

angular.module('system').controller('SITaskViewModalController', ['$scope', '$uibModalInstance', 'data', 'Authentication', 'ModalLauncher',
  function ($scope, $uibModalInstance, data, Authentication, ModalLauncher) {
    $scope.data = data; $scope.user = Authentication.getUser();
    
    // Modal functions
    $scope.cancel = function() {
      $uibModalInstance.close(false);
    };

  }
]);
