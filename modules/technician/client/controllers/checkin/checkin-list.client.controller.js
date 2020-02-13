'use strict';

angular.module('technician').controller('CheckinListController', ['$scope', '$http', 'ModalLauncher', '$timeout',
  function ($scope, $http, ModalLauncher, $timeout) {
    $scope.query = { field: 'id' };

    /*----- Action functions -----*/
    $scope.viewCheckin = function(id){
      $http.get('/api/technician/checkin/view/'+id)
        .error(function() { alert('Request failed. Please check console for error.'); })
        .success(function(checkin) {
          ModalLauncher.launchCheckinViewModal(checkin);
        });
    };
    
    /*----- Query functions -----*/
    var renderCheckins = function(checkins) {
      $scope.checkins = checkins;
      
      $scope.searchMessage = undefined;
      if(checkins.length === 0)
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
        case 'completed':
          body.completionTime = { '$gte' : query.startTime, '$lte' : query.endTime };
          break;
        case 'checkout':
          body.checkoutTime = { '$gte' : query.startTime, '$lte' : query.endTime };
          break;
      }

      if(($scope.textQuery && query.value) || ($scope.dateQuery && query.startTime)){
        $http.post('/api/technician/checkin/query', body)
          .error(function() { alert('Request failed. Please view console for error.'); })
          .success(renderCheckins);
      }
    };

    $scope.incomplete = function() {
      $http.get('/api/technician/checkin/query/incomplete')
        .error(function() { alert('Request failed. Please view console for error.'); })
        .success(renderCheckins);
    };

    $scope.month = function() {
      $http.get('/api/technician/checkin/query/month')
        .error(function() { alert('Request failed. Please view console for error.'); })
        .success(renderCheckins);
    };

    /*----- Watchers ----- */
    $scope.$watch('query.field', function(n, o){
      $scope.textQuery = $scope.statusQuery = $scope.dateQuery = false;
      $timeout(function(){
        if(n && o && (n === 'created' || n === 'completed' || n === 'checkout'))
          $scope.dateQuery = true;
        else $scope.textQuery = true;
      }, 250);
    });
  }
]);
