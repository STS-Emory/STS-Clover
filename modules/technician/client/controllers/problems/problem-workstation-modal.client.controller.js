'use strict';

angular.module('technician').controller('ProblemReportWorkstationController', ['$scope', '$uibModalInstance',
  function ($scope, $uibModalInstance) {
    $scope.input = {};

    // Modal functions
    $scope.cancel = function() {
      $uibModalInstance.close(false);
    };

    $scope.report = function(type) {
      var input = $scope.input;

      if (type == 'Workstation' && (!input.detail || input.detail.length != 10))
        $scope.error = 'Please enter the workstation number (3 digits).';
      else if (type != 'Workstation' && !input.detail)
        $scope.error = 'Please select the type of printer or studio';
      else if (!input.description)
        $scope.error = 'Please enter the description of the problem.';
      else if (!input.fixes)
        $scope.error = 'Please enter your attempted solution.';
      else
        $uibModalInstance.close(input);
    };

    $scope.formatWSNumber = function() {
      var number = $scope.input.detail, digits = number.match(/\d+/)[0];
      if (digits.length > 3) digits = digits.substring(0, 3);

      if (number && digits)
        $scope.input.detail = 'SL-WML-' + digits;
      else $scope.input.detail = '';
    };
  }
]);
