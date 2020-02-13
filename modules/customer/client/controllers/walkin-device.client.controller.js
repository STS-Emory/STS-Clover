'use strict';

angular.module('customer').controller('CustomerWalkinDeviceController', ['$scope', '$state',
  function ($scope, $state) {
    
    if(!$scope.walkin.user)
      $state.go('customer.walkin.netid');
    else $scope.status.state = 'device';

    $scope.selectComputer = function() {
      $scope.walkin.deviceCategory = undefined;

      var oss = [];
      for(var i in $scope.setting.computer_options)
        oss.push($scope.setting.computer_options[i].key);
      $scope.setting.device_specs = oss;

      $state.go('customer.walkin.device-info');
    };

    $scope.selectDevice = function(key, values) {
      $scope.walkin.deviceCategory = key;

      if(values && values.length > 0) {
        $scope.setting.device_specs = values;
        $state.go('customer.walkin.device-info');
      }
      else $state.go('customer.walkin.problem');
    };

    $scope.validateOtherDevice = function(){
      if($scope.walkin.otherDevice) {
        $state.go('customer.walkin.problem');
      }
      else $scope.status.error = 'Please enter your device information correctly.';
    };

    $scope.selectOther = function() {
      $scope.walkin.deviceCategory = 'Other';
      $state.go('customer.walkin.other-device');
    };

    $scope.selectSpec = function(spec) {
      if($scope.walkin.deviceCategory)
        $scope.walkin.deviceInfo = spec;
      else $scope.walkin.deviceCategory = spec;
      $state.go('customer.walkin.problem');
    };
  }
]);
