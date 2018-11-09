'use strict';

angular.module('technician').controller('UserListController', ['$scope', '$http', 'Authentication', 'ModalLauncher',
  function ($scope, $http, Authentication, ModalLauncher) {
    $scope.query = { field: 'netid' };
    $scope.isAdmin = Authentication.hasAdminPerm();

    /*----- Action functions -----*/
    $scope.createTask = function(user) {
      ModalLauncher.launchSITaskCreateModal(user);
    };

    $scope.verify = function(user) {
      user.verified = true;
      $scope.updateUser(user);
    };

    $scope.setActive = function(user) {
      user.isActive = true;
      $scope.updateUser(user);
    };

    $scope.setInactive = function(user) {
      user.isActive = false;
      $scope.updateUser(user);
    };

    $scope.removeTechnician = function(user) {
      var idx = user.roles.indexOf('technician');
      user.roles.splice(idx, 1);
      $scope.updateUser(user);
    };

    $scope.updateUser = function(user){
      $http.put('/api/users/update/'+user.username, user)
        .error(function() { alert('Request failed. Please check console for error.'); });
    };
    
    /*----- Query functions -----*/
    var renderUsers = function(users) {
      $scope.users = users;

      $scope.searchMessage = undefined;
      if(users.length === 0)
        $scope.searchMessage = 'Nothing seems to match with your query. :(';
    };

    $scope.search = function() {
      var query = $scope.query, body = {};

      switch (query.field) {
        case 'netid':
          body.username = { '$regex' : query.value.toLowerCase(), '$options' :  'i' };
          break;
        case 'name':
          body.displayName = { '$regex' : query.value, '$options' :  'i' };
          break;
      }
      
      if(query.value) {
        $http.post('/api/users/query', body)
          .error(function() { alert('Request failed. Please view console for error.'); })
          .success(renderUsers);
      }
    };

    $scope.technician = function() {
      $http.get('/api/users/technician')
        .error(function() { alert('Request failed. Please view console for error.'); })
        .success(renderUsers);
    };

    $scope.invalid = function() {
      $http.get('/api/users/invalid')
        .error(function() { alert('Request failed. Please view console for error.'); })
        .success(renderUsers);
    };

    $scope.invalid();
  }
]);
