'use strict';

angular.module('system').service('EmailLauncher', ['$uibModal', 'ModalLauncher', '$http',
  function($uibModal, ModalLauncher, $http){

    // Return a promise
    this.launchEmailModalWithRecipient = function(email, displayName, callback){
      var modal = $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static',
        controller: 'EmailModalController',
        windowClass: 'fade modal-primary panel-center-modal',
        templateUrl: 'modules/system/client/views/email-recipient-modal.client.view.html',
        resolve: { data: function(){ return { email : email, name : displayName }; } }
      });
      modal.result.then(function(body) {
        if(body && body.subject && body.body){
          body.email = email; body.name = displayName;
          $http.post('/api/technician/email/send', body)
            .error(function(){
              ModalLauncher.launchDefaultWarningModal('Action Failed: Send Email',
                'Email failed to send. Please check console for more detail.');
            });
          if(callback) callback(body);
        }
      });
    };

    this.launchGeneralEmailModal = function(callback){
      var modal = $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static',
        controller: 'EmailModalController',
        windowClass: 'fade modal-primary panel-center-modal',
        templateUrl: 'modules/system/client/views/email-general-modal.client.view.html',
        resolve: { data: function(){ return { }; } }
      });
      modal.result.then(function(body) {
        if(body && body.name && body.email && body.subject && body.body) {
          $http.post('/api/technician/email/send', body)
            .error(function () {
              ModalLauncher.launchDefaultWarningModal('Action Failed: Send Email',
                'Email failed to send. Please check console for more detail.');
            });
          if(callback) callback(body);
        }
      });
    };
  }
]);
