'use strict';

angular.module('technician.admin').controller('AdminImportNetIdController', ['$scope', '$http',
  function ($scope, $http) {


    var processTextFile = function(file){
      var reader = new FileReader();
      reader.onloadend = function(e){
        var entry, entries = [], lines = e.target.result.split('\n');
        for(var lineId in lines) {
          entry = lines[lineId].replace(/\"/g, '').split(',');

          if(entry.length === 5){
            entry[2] += entry[3];
            entry.splice(3,1);
          }
          entries.push(entry);

          if(entry.length !== 4)
            $scope.error = 'Entries are wrongly formatted (line ' + lineId + ').';
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
      var entry = entries[index], obj = { username : entry[0], firstName : entry[1], lastName : entry[2], type : entry[3] };
      $http.post('/userEntries', obj).success(function(){
        $scope.summary.importCount++;
        if(++index < entries.length) importAux(index, entries);
        else $scope.success = 'Successfully imported ' + entries.length + ' user entries';
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
  }
]);
