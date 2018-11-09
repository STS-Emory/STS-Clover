'use strict';

angular.module('technician').controller('CheckinQueueController', ['$scope', '$http', 'Authentication', 'ModalLauncher', '$timeout', 'EmailLauncher',
  function ($scope, $http, Authentication, ModalLauncher, $timeout, EmailLauncher) {
    var user = $scope.user = Authentication.getUser();
    $scope.technician = { username : user.username };

    /*----- Load instance functions -----*/
    $scope.init = function() {
      $http.get('/api/technician/checkin/setting/queue')
        .error(function() { alert('Request failed. Please check console for error.'); })
        .success(function(setting) { $scope.setting = setting; });
      $scope.loadQueue();
    };

    $scope.loadQueue = function() {
      $http.get('/api/technician/checkin/queue')
        .error(function() { alert('Request failed. Please check console for error.'); })
        .success(function(queues) {
          $scope.queues = queues;

          if(queues.working.length > 0 && !$scope.selected)
            $scope.loadCheckin(queues.working[0]);
        });
    };

    $scope.loadCheckin = function(checkin) {
      if(!checkin.templateApplied) $scope.templateViewing = 'N/A';
      else $scope.templateViewing = checkin.templateApplied;
      $scope.updateTemplateTasks();
      
      $scope.selected = checkin;
    };

    $scope.updateCheckin = function(callback) {
      var checkin = $scope.selected;
      $http.put('/api/technician/checkin/update/'+checkin._id, checkin)
        .error(function() { alert('Request failed. Please check console for error.'); })
        .success(function(checkin){ if(callback) callback(checkin); });
    };

    $scope.viewWalkin = function() {
      $http.get('/api/technician/walkin/view/'+$scope.selected.walkin._id)
        .error(function() { alert('Request failed. Please check console for error.'); })
        .success(function(walkin){ ModalLauncher.launchWalkinViewModal(walkin); });

    };

    /*----- Instance status change functions -----*/
    $scope.updateReformatConsent = function() {
      var allow = $scope.selected.reformatConsent = $scope.selected.reformatConsent==='true';
      $scope.updateCheckin(function(){
        if(allow) $scope.logService('Reformat consent updated to "YES"', 'Important');
        else $scope.logService('Reformat consent updated to "NO"', 'Important');
      });
    };
    
    $scope.changeStatus = function(toStatus) {
      var checkin = $scope.selected;
      $http.put('/api/technician/checkin/changeStatus/'+checkin._id, { status : toStatus })
        .error(function() { alert('Request failed. Please check console for error.'); })
        .success(function(updated){
          $scope.logService('Status changed to ' + toStatus, 'Note');

          var idx;
          if((checkin.status === 'Work in progress' || checkin.status === 'Verification pending')){
            idx = $scope.queues.working.indexOf(checkin);

            if((toStatus === 'User action pending' || toStatus === 'Checkout pending')) {
              $scope.queues.working.splice(idx, 1);
              $scope.queues.pending.push(updated);
            }
            else $scope.queues.working[idx] = updated;
          }
          else if((checkin.status === 'User action pending' || checkin.status === 'Checkout pending')){
            idx = $scope.queues.pending.indexOf(checkin);

            if(toStatus === 'Work in progress' || toStatus === 'Verification pending'){
              $scope.queues.pending.splice(idx, 1);
              $scope.queues.working.push(updated);
            }
            else $scope.queues.pending[idx] = updated;
          }
          $scope.selected = updated;
        });
    };

    $scope.checkout = function() {
      var checkin = $scope.selected;
      if(checkin.status === 'Checkout pending'){
        var modal = ModalLauncher.launchCheckinPickupModal(checkin.user.displayName);
        modal.result.then(function(pickupSig) {
          if(pickupSig){
            checkin.pickupSig = pickupSig;
            $http.post('/api/technician/checkin/checkout/'+checkin._id)
              .error(function() { alert('Request failed. Please check console for error.'); })
              .success(function() {
                var idx = $scope.queues.pending.indexOf(checkin);
                $scope.queues.pending.splice(idx, 1);
                $scope.selected = undefined;
              });
          }
        });
      }
    };

    /*----- Instance other functions -----*/
    $scope.sendEmail = function() {
      var user = $scope.selected.user;
      EmailLauncher.launchEmailModalWithRecipient(user.username+'@emory.edu', user.displayName, function(body) {
        $scope.logService('Sent email "' + body.subject + '" to customer.', 'Note');
      });
    };

    $scope.recordCall = function(){
      var now = new Date(Date.now());
      $scope.logService('Called customer at ' + now.toLocaleString(), 'Note');
    };

    $scope.printLabel = function() {
      var checkin = $scope.selected;
      var modal = ModalLauncher.launchDefaultMessageModal(
        'Confirm: Print Label',
        'Are you sure you want to print a label for the selected check-in instance?'
      );
      modal.result.then(function (response) {
        if(response){
          $http.post('/api/technician/checkin/print/label/' + checkin._id)
            .error(function() { alert('Request failed. Please check console for error.'); }); 
        }
      });
    };

    /*----- Instance service log functions -----*/
    $scope.logService = function(content, level) {
      content = content.trim();
      if(content) {
        $http.post('/api/technician/checkin/logService/'+$scope.selected._id,
          { type : level, description : content })
          .error(function() { alert('Request failed. Please check console for error.'); })
          .success(function(entry) { $scope.selected.serviceLog.push(entry); $scope.record = undefined; });
      }
    };

    $scope.updateLog = function(log) {
      $http.put('/api/technician/service-entry/update', log)
        .error(function() { alert('Request failed. Please check console for error.'); });
    };

    $scope.removeLog = function(log) {
      $http.delete('/api/technician/service-entry/update', log)
        .error(function() { alert('Request failed. Please check console for error.'); })
        .success(function() {
          var idx = $scope.selected.serviceLog.indexOf(log);
          if(idx >= 0) $scope.selected.serviceLog.splice(idx, 1);

          $scope.updateCheckin();
        });
    };

    $scope.applyTemplate = function() {
      var template = $scope.templateViewing;
      if(template && template !== 'N/A') {
        $scope.selected.templateApplied = template;
        $scope.updateCheckin(function(){
          $scope.logService('Apply template "' + template + '"', 'Normal');
        });
      }
    };

    /*----- Service log display functions -----*/
    $scope.getLogStyle = function(level) {
      switch (level) {
        case 'Important': return { 'color' : 'red', 'font-weight' : 'bold' };
        case 'Note': return { 'color' : 'grey', 'font-style' : 'italic' };
      }
      return {};
    };

    $scope.disableEditing = function(username, createdAt) {
      return !(Authentication.hasAdminPerm() || (username === user.username && Date.now() - new Date(createdAt).getTime() <= 300000));
    };

    $scope.showRemoval = function(username, createdAt) {
      return Authentication.hasAdminPerm() || (username === user.username && Date.now() - new Date(createdAt).getTime() < 60000);
    };

    $scope.showTemplateImport = function(task) {
      var logs = $scope.selected.serviceLog;
      for(var i in logs) {
        if(task === logs[i].description)
          return false;
      }
      return true;
    };

    /*----- Watchers -----*/
    // Watch if template selected changed
    $scope.updateTemplateTasks = function() {
      var name = $scope.templateViewing;

      if(name && name !== 'N/A'){
        var templates = $scope.setting.templates;
        for(var i in templates)
          if(templates[i].name === name)
            $scope.setting.templateTasks = templates[i].tasks;
      }
      else if (name && name === 'N/A') delete $scope.setting.templateTasks;

      // Force refresh select2 selection box (Work around)
      $timeout(function(){
        angular.element('#templates').select2({ minimumResultsForSearch: Infinity });
      }, 10);
    };

  }
]);
