'use strict';

angular.module('system').controller('CheckinViewModalController', ['$scope', '$uibModalInstance', 'data', 'Authentication', '$http', '$timeout',
  function ($scope, $uibModalInstance, data, Authentication, $http, $timeout) {
    $scope.data = data;
    $scope.user = Authentication.getUser();
    
    // Modal functions
    $scope.cancel = function(){
      $uibModalInstance.close(false);
    };

    $scope.servicenowSync = function() {
      $http.post('/api/technician/checkin/servicenowSync/'+$scope.data.checkin._id)
        .error(function(err) { $scope.error = err; })
        .success(function(checkin) { $scope.data.checkin = checkin; });
    };
    
  }
]);
