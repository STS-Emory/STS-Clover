'use strict';

angular.module('technician').controller('LoginController', ['$scope', '$state', '$http', 'Authentication',
  function ($scope, $state, $http, Authentication) {
    $scope.authentication = Authentication;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) $state.go('tech.home');

    $scope.signin = function() {
      $scope.error = null;

      if (!$scope.credentials || !$scope.credentials.username || !$scope.credentials.password){
        $scope.error = 'Missing required login credentials.';
        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        $scope.authentication.user = response; $state.go('tech.home');
      }).error(function (response) { $scope.error = response.message; });
    };
  }
]);
