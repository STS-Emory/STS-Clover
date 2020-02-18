'use strict';

angular.module('system').controller('SITaskCreateModalController', ['$scope', '$uibModalInstance', 'data', 'Authentication', '$http',
  function ($scope, $uibModalInstance, data, Authentication, $http) {
    $scope.data = data; $scope.data.sitask = {}; $scope.template = {}; $scope.data.chore = {};
    $scope.user = Authentication.getUser();
    $scope.importedUsers= [];
    var templateC = {};
    $scope.allUsers = [];
    var customTemplate = function(newT, oldT){
      newT.name = oldT.name;
      newT.taskDetails = oldT.task_details;
      newT.techMessage = oldT.technician_message;
      newT.customerMessage = oldT.customer_message;
      newT.choreInstruction = oldT.chore_instruction;
      
    };
    
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
      console.log(templateC);
    };
    //importing users
    var processTextFile = function(file){
      var reader = new FileReader();
      reader.onloadend = function(e){
        var entry, entries = [], lines = e.target.result.split('\n');
        for(var lineId in lines) {
          entry = lines[lineId].replace(/\"/g, '');
          entry = entry.trim();
          if(entry.length>7){
            $scope.error = 'Entries are wrongly formatted (line ' + lineId + ').';
          }else {
            if(entry.length>1)entries.push(entry);
          }
            
        }
        $scope.$apply(function(){
          $scope.loading = false; $scope.entries = entries;
          $scope.summary.count = entries.length;
          $scope.summary.importCount = 0;

          $scope.success = 'Found ' + entries.length + ' user entries.';
        });
      };
      reader.readAsText(file);
    };

    var logError = function(err){ $scope.success = undefined; $scope.error = err; };
    var importAux = function(index, entries){
      var entry = ''+entries[index];
      var query = { username: entry.toLowerCase() };
      $http.post('/api/modal/getUser', query).success(function(user){
        $scope.summary.importCount++;
        $scope.importedUsers.push(user);
        $scope.allUsers.push(user.username);
        if(++index < entries.length) importAux(index, entries);
        else {$scope.success = 'Successfully imported ' + entries.length + ' user entries';
          $scope.importedUsers.push($scope.data.user);
          $scope.allUsers.push($scope.data.user.username);
        }
      }).error(logError);
      
    };
    
    $scope.import = function(){
      $scope.summary.importCount = 0;
      $scope.importing = true;
      $scope.success = $scope.error = undefined;
      var entries = $scope.entries, error = $scope.summary.error;
      if(!error && entries){
        importAux(0, entries);
      }

    };

    $scope.$watch('file', function(file) {
      if(file) {
        $scope.loading = true;
        $scope.importing = false;
        $scope.summary = {};
        $scope.success = $scope.error = undefined;
        processTextFile(file);
      }
    });

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
      customTemplate(templateC, $scope.template);
      replacePlaceHolder($scope.template, $scope.data.user);

      $scope.data.sitask.description = $scope.template.task_details;
      $scope.data.sitask.msg_DisplayCustomer = $scope.template.customer_message;
      $scope.data.sitask.msg_DisplayTechnician = $scope.template.technician_message;
      $scope.data.chore.instruction = $scope.template.chore_instruction;
    };
    
    var multiplePlaceHolders = function(sitask, chore, user, template){
      var name = ''+user.displayName;
      var phone_numer = ''+user.phone;
      phone_numer = phone_numer ? phone_numer.substring(0, 3) + '-' + phone_numer.substring(3, 6) + '-' + phone_numer.substring(6) : '{NO NUMBER ON RECORD}';
      sitask.username = ''+user.username;

      console.log(name+'\n'+phone_numer+'\n'+sitask.username);
      console.log(template);
      sitask.description = template.taskDetails.replace('{PHONE}', phone_numer).replace('{NAME}', name);
      sitask.msg_DisplayCustomer = template.customerMessage.replace('{PHONE}', phone_numer).replace('{NAME}', name);
      sitask.msg_DisplayTechnician = template.techMessage.replace('{PHONE}', phone_numer).replace('{NAME}', name);

      if (chore) chore.instruction = template.choreInstruction.replace('{PHONE}', phone_numer).replace('{NAME}', name);
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

    var createMultAuax = function(idx,users) {
      var chore = $scope.data.chore;
      var SITask =$scope.data.sitask;
      var user = users[idx];
      multiplePlaceHolders(SITask,chore,user,templateC);

      if($scope.createChore && chore) {
        if (!chore.instruction)$scope.error = 'Please enter the instruction for the chore.';
        else{
          $http.post('/api/tech/chore/create', chore)
            .error(function () { $scope.error = 'Server error while creating chore'; })
            .success(function(chore) {
              SITask.chores = [chore._id];
              $http.post('/api/tech/sitask/create',SITask)
                .success(function(){
                  if(++idx<users.length) createMultAuax(idx,users);
                  else $uibModalInstance.close(true);
                }).error(function(){ alert('Sever Error while creating SITask.'); });
            });
        }
      }
      else {$http.post('/api/tech/sitask/create',SITask)
        .success(function(){
          if(++idx<users.length) createMultAuax(idx,users);
          else $uibModalInstance.close(true);
        }).error(function(){ alert('Sever Error while creating SITask.'); });}
    };
    

    $scope.createTasks = function(){
      var sitask = $scope.data.sitask;
      $scope.error = undefined;

      if(!sitask.description)
        $scope.error = 'Please enter the description for the task.';
      else if (!sitask.msg_DisplayCustomer)
        $scope.error = 'Please enter the message that will be displayed to the customer.';
      else if (!sitask.msg_DisplayTechnician)
        $scope.error = 'Please enter the message that will be displayed to the technician.';
      else {
        var users = $scope.importedUsers;
        createMultAuax(0,users);
      }
    };
  }
]);
