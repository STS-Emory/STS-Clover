'use strict';

angular.module('technician').controller('ProblemReportController', ['$scope', '$http', '$timeout', 'ProblemLauncher', 'ModalLauncher',
  function ($scope, $http, $timeout, ProblemLauncher, ModalLauncher) {
    $scope.reportProblem = function(type){
      var modal = ProblemLauncher.launchProblemReportModal(type);
      modal.result.then(function(result) {
        result.type = type;

        $http.post('/api/technician/email/report/problem/workstations', result)
          .success(function(){ $scope.success = true; })
          .error(function(){
            $scope.error = true;
            ModalLauncher.launchDefaultWarningModal('Server Error', 'Unable to report the problem.');
          });
        $timeout(function(){ $scope.error = $scope.success = undefined; }, 3000);
      });
    };
  }
]);
