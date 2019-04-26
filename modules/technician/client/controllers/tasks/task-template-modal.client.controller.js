'use strict';

angular.module('system').controller('TaskTemplateModalController', ['$scope', '$uibModalInstance', 'data', 
  function ($scope, $uibModalInstance, data) {
    $scope.template = data.template;
    
    // Modal functions
    $scope.cancel = function() {
      $uibModalInstance.close(false);
    };

    $scope.create = function () {
      var template = $scope.template;

      $scope.error = undefined;
      if(!template.task_details)
        $scope.error = 'Please enter the description for the task.';
      else if (!template.customer_message)
        $scope.error = 'Please enter the message that will be displayed to the customer.';
      else if (!template.technician_message)
        $scope.error = 'Please enter the message that will be displayed to the technician.';
      else
        $uibModalInstance.close(template);
    };
  }
]);
