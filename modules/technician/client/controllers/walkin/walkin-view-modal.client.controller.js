'use strict';

angular.module('system').controller('WalkinViewModalController', ['$scope', '$uibModalInstance', 'data', 'Authentication', '$http', '$timeout',
  function ($scope, $uibModalInstance, data, Authentication, $http, $timeout) {
    $scope.data = data;
    $scope.user = Authentication.getUser();

    var option2Obj = function(val){
      return { text : val, value : val };
    };

    /*----- Load instance functions -----*/
    $scope.init = function() {
      $http.get('/api/technician/walkin/setting').success(function (setting) {
        // Create map for type -> specs
        var i, options = $scope.device_options = {};
        // OS's
        for (i in setting.computer_options)
          options[setting.computer_options[i].key] = setting.computer_options[i].values.map(option2Obj);
        // Other devices
        for (i in setting.device_options)
          options[setting.device_options[i].key] = setting.device_options[i].values.map(option2Obj);
        options.Other = [];

        $scope.device_categories = (Object.keys(options)).map(option2Obj);
        $scope.location_options = setting.location_options.map(option2Obj);

        // Initialize resolution template
        $scope.resolutions_options = setting.resolutions_options;
      });
    };

    // Modal functions
    $scope.cancel = function(){
      $uibModalInstance.close(false);
    };

    $scope.servicenowSync = function() {
      $http.post('/api/technician/walkin/servicenowSync/'+$scope.data.walkin._id)
        .error(function(err) { $scope.error = err; })
        .success(function(walkin) { $scope.data.walkin = walkin; });
    };

    $scope.forward = function(){
      $http.post('/api/technician/walkin/forward/'+$scope.data.walkin._id)
        .error(function() { $scope.error = 'Forward failed.'; })
        .success(function(walkin) { $scope.data.walkin = walkin; });
    };

    $scope.update = function() {
      $scope.error = $scope.success = undefined;
      $http.put('/api/technician/walkin/update/'+$scope.data.walkin._id, $scope.data.walkin)
        .error(function() { $scope.error = 'Saved failed.'; })
        .success(function() { $scope.success = 'Saved successfully.'; });
      $timeout(function(){ $scope.error = $scope.success = undefined; }, 3000);
    };

    /*----- Watchers -----*/
    // Watch if customer name changed.
    $scope.onDisplayNameChange = function() {
      var name = $scope.selected.user.displayName, idx = name.lastIndexOf(' ');
      $scope.data.walkin.user.firstName = name.substring(0, idx);
      $scope.data.walkin.user.lastName = name.substring(idx+1);
    };
  }
]);
