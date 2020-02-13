'use strict';

angular.module('technician').controller('UserSettingController', ['$scope', '$http',
  function ($scope, $http) {
    // Expose view variables
    $scope.password = {};

    $scope.changePwd = function() {
      var password = $scope.password;
      $scope.passwordMsg = {};

      if(!password.currentPassword || !password.newPassword || !password.verifyPassword)
        return ($scope.passwordMsg.error = 'Missing required fields.');
      else if(password.currentPassword === password.newPassword)
        return ($scope.passwordMsg.error = 'Password entered is the same as current.');
      else if(password.newPassword !== password.verifyPassword)
        return ($scope.passwordMsg.error = 'Passwords entered does not match.');

      $http.post('/api/users/password', password)
        .success(function(response){ $scope.passwordMsg.success = response.message; })
        .error(function(response){ $scope.passwordMsg.error = response.message; });
    };

  }
]);
