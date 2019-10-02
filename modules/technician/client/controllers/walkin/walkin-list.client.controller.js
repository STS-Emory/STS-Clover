'use strict';

angular.module('technician').controller('WalkinListController', ['$scope', '$http', 'ModalLauncher', '$timeout',
  function ($scope, $http, ModalLauncher, $timeout) {
    $scope.query = { field: 'id' };

    /*----- Action functions -----*/
    $scope.viewWalkin = function(id){
      $http.get('/api/technician/walkin/view/'+id)
        .error(function() { alert('Request failed. Please check console for error.'); })
        .success(function(walkin) {
          ModalLauncher.launchWalkinViewModal(walkin);
        });
    };
    
    /*----- Query functions -----*/
    var renderWalkins = function(walkins) {
      $scope.walkins = walkins;

      $scope.searchMessage = undefined;
      if(walkins.length === 0)
        $scope.searchMessage = 'Nothing seems to match with your query. :(';
    };

    $scope.search = function() {
      var query = $scope.query, body = {};
      var now = new Date(Date.now());
      if($scope.dateQuery && !query.endTime)
        $scope.query.endTime = now;

      switch (query.field) {
        case 'id':
          query.value = query.value.replace(/\D/g, '');
          body._id = query.value;
          break;
        case 'netid':
          body.username = { '$regex' : query.value.toLowerCase(), '$options' :  'i' };
          break;
        case 'name':
          body.displayName = { '$regex' : query.value, '$options' :  'i' };
          break;
        case 'servicenow':
          query.value = 'INC' + query.value.replace(/\D/g, '');
          body.snValue = { '$regex' : query.value, '$options': 'i' };
          break;
        case 'created':
          body.created = { '$gte' : query.startTime, '$lte' : query.endTime };
          break;
        case 'resolved':
          body.resolutionTime = { '$gte' : query.startTime, '$lte' : query.endTime };
          break;
      }

      if(($scope.textQuery && query.value) || ($scope.dateQuery && query.startTime)){
        $http.post('/api/technician/walkin/query', body)
          .error(function() { alert('Request failed. Please view console for error.'); })
          .success(renderWalkins);
      }
    };

    $scope.today = function() {
      $http.get('/api/technician/walkin/query/today')
        .error(function() { alert('Request failed. Please view console for error.'); })
        .success(renderWalkins);
    };

    $scope.unresolved = function() {
      $http.get('/api/technician/walkin/query/unresolved')
        .error(function() { alert('Request failed. Please view console for error.'); })
        .success(renderWalkins);
    };

    $scope.month = function() {
      $http.get('/api/technician/walkin/query/month')
        .error(function() { alert('Request failed. Please view console for error.'); })
        .success(renderWalkins);
    };

    /*----- Watchers ----- */
    $scope.$watch('query.field', function(n, o){
      $scope.textQuery = $scope.statusQuery = $scope.dateQuery = false;
      $timeout(function(){
        if(n && o && (n === 'created' || n === 'resolved'))
          $scope.dateQuery = true;
        else $scope.textQuery = true;
      }, 250);
    });
  }
]);
