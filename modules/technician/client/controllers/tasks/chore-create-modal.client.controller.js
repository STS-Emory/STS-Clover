'use strict';

angular.module('system').controller('ChoreCreateController', ['$scope', '$uibModalInstance', '$http',
  function ($scope, $uibModalInstance, $http) {
    $scope.chore = { };

    $scope.create = function() {
      var chore = $scope.chore;

      if(!chore.instruction) {
        $scope.error = 'Missing chore instruction'; return false;
      }
      else {
        $http.post('/api/tech/chore/create', chore)
          .error(function() { $scope.error = 'Server error.'; return false; })
          .success(function(chore) { $uibModalInstance.close(chore); });
      }
    };
    
    // Modal functions
    $scope.cancel = function(){
      $uibModalInstance.close(false);
    };
    
  }
]);
