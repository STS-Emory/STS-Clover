'use strict';

angular.module('customer').controller('CustomerWalkinProblemController', ['$scope', '$state',
  function ($scope, $state) {
    
    if(!$scope.walkin.user)
      $state.go('customer.walkin.netid');
    else $scope.status.state = 'problem';

    $scope.toReview = function() {
      if($scope.walkin.description) {
        $state.go('customer.walkin.review');
      }
      else $scope.status.error = 'Please enter your problem description correctly';
    };
  }
]);
