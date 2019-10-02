'use strict';

angular.module('system').service('ModalLauncher', ['$uibModal',
  function($uibModal){

    this.launchDefaultMessageModal = function(title, message){
      return $uibModal.open({
        animation: true, size: 'md', backdrop: 'static',
        controller: 'DefaultModalController',
        windowClass: 'fade modal-info panel-center-modal',
        templateUrl: 'modules/system/client/views/default-message-modal.client.view.html',
        resolve: { data: function(){ return { title: title, message: message }; } }
      });
    };

    this.launchDefaultWarningModal = function(title, message){
      return $uibModal.open({
        animation: true, size: 'md', backdrop: 'static',
        controller: 'DefaultModalController',
        windowClass: 'fade modal-danger panel-center-modal',
        templateUrl: 'modules/system/client/views/default-message-modal.client.view.html',
        resolve: { data: function(){ return { title: title, message: message }; } }
      });
    };

    this.launchWalkinLiabilityModal = function(){
      return $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static',
        controller: 'DefaultModalController',
        windowClass: 'fade modal-warning',
        templateUrl: 'modules/customer/client/views/walkin/walkin-liability-modal.client.view.html',
        resolve: { data: function(){ return { }; } }
      });
    };
    
    this.launchWalkinViewModal = function(walkin){
      $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static',
        controller: 'WalkinViewModalController',
        windowClass: 'fade modal-primary panel-center-modal',
        templateUrl: 'modules/technician/client/views/walkin/walkin-view-modal.client.view.html',
        resolve: { data: function(){ return { walkin: walkin }; } }
      });
    };
    
    this.launchCheckinLiabilityModal = function(displayName){
      return $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static',
        controller: 'DefaultModalController',
        windowClass: 'fade modal-warning panel-center-modal',
        templateUrl: 'modules/technician/client/views/checkin/checkin-liability-modal.client.view.html',
        resolve: { data: function(){ return { displayName: displayName }; } }
      });
    };

    this.launchCheckinPickupModal = function(displayName){
      return $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static',
        controller: 'DefaultModalController',
        windowClass: 'fade modal-warning panel-center-modal',
        templateUrl: 'modules/technician/client/views/checkin/checkin-pickup-modal.client.view.html',
        resolve: { data: function(){ return { displayName: displayName }; } }
      });
    };

    this.launchCheckinViewModal = function(checkin){
      $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static',
        controller: 'CheckinViewModalController',
        windowClass: 'fade modal-primary panel-center-modal',
        templateUrl: 'modules/technician/client/views/checkin/checkin-view-modal.client.view.html',
        resolve: { data: function(){ return { checkin : checkin }; } }
      });
    };

    this.launchChoreCreateModal = function() {
      return $uibModal.open({
        animation: true, size: 'md', backdrop: 'static',
        controller: 'ChoreCreateController',
        windowClass: 'fade modal-primary panel-center-modal',
        templateUrl: 'modules/technician/client/views/tasks/chore-create-modal.client.view.html',
        resolve: { data: function(){ return { }; } }
      });
    };

    this.launchCalendarModal = function(studio) {
      var template = 'modules/technician/client/views/calendar/{}-calendar-modal.client.view.html'.replace('{}', studio);
      return $uibModal.open({
        animation: true, size: 'md', backdrop: 'static',
        controller: 'ChoreCreateController',
        windowClass: 'fade modal-primary panel-center-modal',
        templateUrl: template,
        resolve: { data: function(){ return { }; } }
      });
    };

    this.launchSITaskCreateModal = function(user) {
      return $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static', keyboard: false,
        controller: 'SITaskCreateModalController',
        windowClass: 'fade modal-warning panel-center-modal',
        templateUrl: 'modules/technician/client/views/tasks/sitask-create-modal.client.view.html',
        resolve: { 
          data: function(){ return { user : user }; } 
        }
      });
    };

    this.launchSITaskViewModal = function(sitask) {
      $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static',
        controller: 'SITaskViewModalController',
        windowClass: 'fade modal-warning panel-center-modal',
        templateUrl: 'modules/technician/client/views/tasks/sitask-view-modal.client.view.html',
        resolve: { data: function(){ return { sitask : sitask }; } }
      });
    };

    this.launchSITaskEditModal = function(sitask) {
      return $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static',
        controller: 'SITaskEditModalController',
        windowClass: 'fade modal-warning panel-center-modal',
        templateUrl: 'modules/technician/client/views/tasks/sitask-edit-modal.client.view.html',
        resolve: { data: function(){ return { sitask : sitask }; } }
      });
    };

    this.launchTaskTemplateModal = function(template) {
      return $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static', keyboard: false,
        controller: 'TaskTemplateModalController',
        windowClass: 'fade modal-warning panel-center-modal',
        templateUrl: 'modules/technician/client/views/tasks/task-template-modal.client.view.html',
        resolve: { data: function(){ return { template : template }; } }
      });
    };

    this.launchInsertModal = function(title, message, placeholder, options){
      return $uibModal.open({
        animation: true, size: 'lg', backdrop: 'static',
        controller: 'InsertModalController',
        windowClass: 'fade modal-warning panel-center-modal',
        templateUrl: 'modules/technician/client/views/admin/insert.modal.view.html',
        resolve: { data: function(){ return { title: title, message: message, placeholder: placeholder, options: options }; } }
      });
    };

    // Return a promise
    this.launchDefaultInputModal = function(title, message, placeholder){
      return $uibModal.open({
        animation: true, size: 'md', backdrop: 'static',
        controller: 'DefaultModalController',
        windowClass: 'fade modal-warning panel-center-modal',
        templateUrl: 'modules/system/client/views/default-input-modal.client.view.html',
        resolve: { data: function(){ return { title: title, message: message, placeholder: placeholder }; } }
      });
    };
  }
]);
