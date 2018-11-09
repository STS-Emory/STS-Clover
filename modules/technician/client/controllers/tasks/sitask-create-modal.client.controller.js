'use strict';

angular.module('system').controller('SITaskCreateModalController', ['$scope', '$uibModalInstance', 'data', 'Authentication', '$http',
  function ($scope, $uibModalInstance, data, Authentication, $http) {
    $scope.data = data; $scope.data.sitask = {};
    $scope.user = Authentication.getUser();
    
    // Modal functions
    $scope.cancel = function() {
      $uibModalInstance.close(false);
    };

    var createAux = function(sitask) {
      $http.post('/api/tech/sitask/create', sitask)
        .error(function(){ alert('Sever Error while creating SITask.'); })
        .success(function(){ $uibModalInstance.close(true); });
    };

    $scope.create = function () {
      var sitask = $scope.data.sitask;

      $scope.error = undefined;
      if(!sitask.description)
        $scope.error = 'Please enter the description for the task.';
      else if (!sitask.msg_DisplayCustomer)
        $scope.error = 'Please enter the message that will be displayed to the customer.';
      else if (!sitask.msg_DisplayTechnician)
        $scope.error = 'Please enter the message that will be displayed to the technician.';
      else {
        if($scope.data.user)
          sitask.username = $scope.data.user.username;

        if($scope.createChore) {
          var chore = $scope.data.chore;
          if (!chore.instruction)
            $scope.error = 'Please enter the instruction for the chore.';
          else {
            $http.post('/api/tech/chore/create', chore)
              .error(function () { $scope.error = 'Server error while creating chore'; })
              .success(function(chore) {
                sitask.chores = [chore._id];
                createAux(sitask);
              });
          }
        }
        else createAux(sitask);
      }
    };
  }
]);
