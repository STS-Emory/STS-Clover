'use strict';

angular.module('system').service('ProblemLauncher', ['$uibModal',
  function($uibModal){

    // Return a promise
    this.launchProblemReportModal = function(type){

      var config = {
        animation: true, size: 'lg', backdrop: 'static',
        windowClass: 'fade modal-primary panel-center-modal'
      };

      config.controller = 'ProblemReportModalController';

      switch(type) {
        case 'Workstations':
          config.templateUrl = 'modules/technician/client/views/problems/problem-workstation-modal.client.view.html';
          break;
        case 'Studio':
          config.templateUrl = 'modules/technician/client/views/problems/problem-studio-modal.client.view.html';
          break;
        case 'Printer':
          config.templateUrl = 'modules/technician/client/views/problems/problem-printer-modal.client.view.html';
          break;
        case 'Study Room':
          config.templateUrl = 'modules/technician/client/views/problems/problem-room-modal.client.view.html';
          break;
      }
      return $uibModal.open(config);
    };
  }
]);
