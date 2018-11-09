'use strict';

angular.module('customer').controller('CustomerWalkinReviewController', ['$scope', '$state', 'ModalLauncher', '$http',
  function ($scope, $state, ModalLauncher, $http) {
    
    if(!$scope.walkin.user)
      $state.go('customer.walkin.netid');
    else $scope.status.state = 'review';

    $scope.confirm = function() {
      var modal = ModalLauncher.launchWalkinLiabilityModal();
      modal.result.then(function(liability) {
        if(liability){
          $scope.walkin.liabilityAgreement = liability;
          $http.post('/api/technician/walkin/create', $scope.walkin)
            .error(function() { alert('Request failed. Please check console for error.'); })
            .success(function() { $state.go('customer.walkin-success'); });
        }
      });
    };
  }
]);
