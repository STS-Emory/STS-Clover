'use strict';

angular.module('system').service('ProblemLauncher', ['$uibModal',
  function($uibModal){

    // Return a promise
    this.launchProblemReportModal = function(type){

      var config = {
        animation: true, size: 'lg', backdrop: 'static',
        windowClass: 'fade modal-primary panel-center-modal'
      };

      switch(type) {
        case 'Workstations':
          config.controller = 'ProblemReportWorkstationController';
          config.templateUrl = 'modules/technician/client/views/problems/problem-workstation-modal.client.view.html';
          break;
        case 'Studio':
          config.controller = 'ProblemReportWorkstationController';
          config.templateUrl = 'modules/technician/client/views/problems/problem-studio-modal.client.view.html';
          break;
        case 'Printer':
          config.controller = 'ProblemReportWorkstationController';
          config.templateUrl = 'modules/technician/client/views/problems/problem-printer-modal.client.view.html';
          break;
      }
      return $uibModal.open(config);
    };
  }
]);
