'use strict';

angular.module('technician').controller('WalkinTransferController', ['$scope', '$http', 'Authentication', 'ModalLauncher', '$state', '$stateParams', '$timeout',
  function($scope, $http, Authentication, ModalLauncher, $state, $stateParams, $timeout) {
    $scope.checkin = { reformatConsent : true };

    $scope.init = function() {
      var walkinId = $stateParams.walkinId;

      $http.get('/api/technician/checkin/hasTransferred/'+walkinId)
        .error(function() { alert('Request failed. Please check console for error.'); })
        .success(function(hasTransferred) {
          if(hasTransferred) {
            var closed = ModalLauncher.launchDefaultMessageModal(
              'Action Failed: Invalid Walk-in',
              'The walk-in instance you wished to transfer has already been transferred. Thus a check-in instance already has this walk-in attached to.'
            );
            closed.result.then(function(){ $state.go('tech.home'); });
          }
          else {
            $http.get('/api/technician/checkin/setting/transfer')
              .error(function() { alert('Request failed. Please check console for error.'); })
              .success(function(setting) { $scope.setting = setting; });

            $http.get('/api/technician/walkin/view/'+walkinId)
              .error(function() { alert('Request failed. Please check console for error.'); })
              .success(function(walkin) { $scope.walkin = walkin; });
          }
        });
    };

    $scope.viewWalkin = function(){
      ModalLauncher.launchWalkinViewModal($scope.walkin);
    };

    var getSelectedStringArray = function(map) {
      var i, keys = Object.keys(map), items = [];
      for(i in keys) if(map[keys[i]]) items.push(keys[i]);
      return items;
    };

    $scope.transfer = function() {
      var checkin = $scope.checkin;
      
      if(!checkin.preDiagnostic) $scope.error = 'Missing preliminary diagnostics.';
      else if(!checkin.suggestedAction) $scope.error = 'Missing suggested actions.';
      else if(!checkin.deviceManufacturer) $scope.error = 'Missing device brand information.';
      else if(!checkin.deviceModel) $scope.error = 'Missing device model information.';
      else if(!checkin.deviceInfoUser) $scope.error = 'Missing device username credential.';
      else if(!checkin.deviceInfoPwd) $scope.error = 'Missing device username password.';

      if($scope.error) {
        $timeout(function() { $scope.error = undefined; }, 5000);
        return false;
      }
      checkin.deviceInfoOS = checkin.deviceInfoOSAux? getSelectedStringArray(checkin.deviceInfoOSAux) : [];
      checkin.itemReceived = checkin.itemReceivedAux? getSelectedStringArray(checkin.itemReceivedAux) : [];

      var modal = ModalLauncher.launchCheckinLiabilityModal($scope.walkin.user.displayName);
      modal.result.then(function(liabilitySig) {
        if(liabilitySig) {
          checkin.liabilitySig = liabilitySig;
          
          $http.post('/api/technician/checkin/transfer/' + $scope.walkin._id, checkin)
            .error(function() { alert('Request failed. Please check console for error.'); })
            .success(function(checkin) { $state.go('tech.checkin.queue'); });
        }
      });
    };
  }
]);
