'use strict';

angular.module('system').controller('SITaskCreateModalController', ['$scope', '$uibModalInstance', 'data', 'Authentication', '$http',
  function ($scope, $uibModalInstance, data, Authentication, $http) {
    $scope.data = data; $scope.data.sitask = {}; $scope.template = {}; $scope.data.chore = {};
    $scope.user = Authentication.getUser();

    $scope.init = function() {
      $http.get('/api/tech/sitask/settings')
      .error(function () { $scope.error = 'Server error while creating chore'; })
      .success(function(settings){
        $scope.settings = settings;
      });
    };
    
    // Modal functions
    $scope.cancel = function() {
      $uibModalInstance.close(false);
    };

    var createAux = function(sitask) {
      $http.post('/api/tech/sitask/create', sitask)
        .error(function(){ alert('Sever Error while creating SITask.'); })
        .success(function(){ $uibModalInstance.close(true); });
    };

    var replacePlaceHolder = function(template, user){
      var name = user.displayName;
      var phone_numer = user.phone;
      phone_numer = phone_numer ? phone_numer.substring(0, 3) + '-' + phone_numer.substring(3, 6) + '-' + phone_numer.substring(6) : '{NO NUMBER ON RECORD}';

      template.task_details = template.task_details.replace('{PHONE}', phone_numer).replace('{NAME}', name);
      template.customer_message = template.customer_message.replace('{PHONE}', phone_numer).replace('{NAME}', name);
      template.technician_message = template.technician_message.replace('{PHONE}', phone_numer).replace('{NAME}', name);
      template.chore_instruction = template.chore_instruction.replace('{PHONE}', phone_numer).replace('{NAME}', name);
    };

    $scope.onTemplateChange = function() {
      replacePlaceHolder($scope.template, $scope.data.user);
      $scope.data.sitask.description = $scope.template.task_details;
      $scope.data.sitask.msg_DisplayCustomer = $scope.template.customer_message;
      $scope.data.sitask.msg_DisplayTechnician = $scope.template.technician_message;
      $scope.data.chore.instruction = $scope.template.chore_instruction;
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
