'use strict';

angular.module('technician.admin').controller('AdminUserController', ['$scope', '$http',
  function ($scope, $http) {
    // Expose view variables
    $scope.register = { registerAs : { customer : true } };

    $scope.clearMsgs = function() {
      $scope.registerMsg = {}; $scope.resetMsg = {}; $scope.removeMsg = {};
    };
    $scope.clearMsgs();

    $scope.registerUser = function() {
      $scope.clearMsgs();

      var registerAs = $scope.register.registerAs;
      $scope.register.roles = Object.keys(registerAs).filter(function(val) { return registerAs[val] === true; });

      $http.post('/api/auth/registerUser', $scope.register).success(function (response) {
        if(!$scope.register.randomPwd)
          $scope.registerMsg.success = 'User registered successfully!';
        else
          $scope.registerMsg.success = 'User registered successfully! Password: ' + response.password;

        $scope.register = { registerAdmin : false };
      }).error(function (response) {
        $scope.registerMsg.error = 'Missing necessary fields for registration. ('+ response.message + ')';
      });
    };

    $scope.resetUser = function() {
      $scope.clearMsgs();
      if($scope.reset && $scope.reset.username){
        $http.put('/api/auth/resetPwd/'+$scope.reset.username)
          .success(function(response){
            $scope.resetMsg.success = 'New password: ' + response.password;
          })
          .error(function(response){
            $scope.resetMsg.error = response.message;
          }
        );
      }
      else
        $scope.resetMsg.error = 'Missing username.';
    };

    $scope.removeTechnician = function() {
      $scope.clearMsgs();
      if($scope.remove && $scope.remove.username){
        $http.put('/api/auth/removeTechnician/'+$scope.remove.username)
          .success(function(response){
            $scope.removeMsg.success = 'Remove successfully!';
          })
          .error(function(response){
            $scope.removeMsg.error = response.message;
          }
        );
      }
      else $scope.removeMsg.error = 'Missing username.';
    };
  }
]);
