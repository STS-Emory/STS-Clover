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
      }
      return $uibModal.open(config);
    };
  }
]);
