'use strict';

angular.module('technician').controller('TaskCenterController', ['$scope', '$state', '$http', 'ModalLauncher',
  function ($scope, $state, $http, ModalLauncher) {

    $scope.init = function() {
      $scope.listChores_today();
      $scope.listSITasks_incomplete();
    };

    $scope.createSITaskChore = function(sitaskIdx, sitask) {
      var modal = ModalLauncher.launchChoreCreateModal();
      modal.result.then(function(chore) {
        if(chore) {
          sitask.chores.push(chore);

          $http.post('/api/tech/sitask/update/' + sitask._id, sitask)
            .success(function(sitask) {
              $scope.sitasks.splice(sitaskIdx, 1, sitask);
              $scope.chores.unshift(chore);
            })
            .error(function() { alert('Server error when creating sitask chore.'); });
        }
      });
    };

    $scope.listChores_dateQuery = function(date) {
      var date_start = new Date(date).getTime(), date_end = date_start + 1000*60*60*24;
      var query = { '$or' : [{ created: { '$gte': date_start, '$lte': date_end } },
                             { completed: { '$gte': date_start, '$lte': date_end } }] };
      $http.post('/api/tech/chore/query', query)
        .success(function(chores) { $scope.chores = chores; })
        .error(function() { alert('Server error when fetching chores.'); });
    };

    $scope.listChores_yesterday = function() {
      var today = new Date(Date.now()); today.setHours(0);
      var yesterday = new Date(today.getTime() - 1000*60*60*24);

      $scope.listChores_dateQuery(yesterday);
    };

    $scope.listChores_today = function() {
      $http.get('/api/tech/chore/list')
        .success(function(chores) { $scope.chores = chores; })
        .error(function() { alert('Server error when fetching chores.'); });
    };

    $scope.listChores_incomplete = function() {
      $http.get('/api/tech/chore/list')
        .success(function(chores) {
          chores = chores.filter(function(chore){ return !chore.note && !chore.completed; });
          $scope.chores = chores;
        })
        .error(function() { alert('Server error when fetching chores.'); });
    };

    $scope.completeChore = function(choreIdx) {
      var chore = $scope.chores[choreIdx];

      if(chore.note) {
        $http.post('/api/tech/chore/complete/' + chore._id, chore)
          .success(function(chore) { $scope.chores.splice(choreIdx, 1, chore); })
          .error(function() { alert('Server error when completing chores.'); });
      }
      else ModalLauncher.launchDefaultMessageModal('Invalid Note', 'Please enter note (work done) to complete chore.');
    };

    $scope.showChoreNote = function(choreId) {
      var chore = $scope.chores[choreId];
      ModalLauncher.launchDefaultMessageModal('Chore Note', chore.note);
    };

    $scope.listSITasks_incomplete = function() {
      $http.get('/api/tech/sitask/list')
        .success(function(sitasks) { $scope.sitasks = sitasks; })
        .error(function() { alert('Server error when fetching STS tasks.'); });
    };

    $scope.querying_sitask = false;
    $scope.$watch('sitask_netid', function(netid) {
      if(netid && netid.length >= 4) {
        $scope.querying_sitask = true;

        var query = { username : { '$regex' : netid, '$options': 'i' } };
        $http.post('/api/tech/sitask/query', query)
          .success(function(sitasks) { $scope.sitasks = sitasks; })
          .error(function() { alert('Server error when fetching STS tasks.'); });
      }
      else if($scope.querying_sitask) {
        $scope.querying_sitask = false;
        $scope.listSITasks_incomplete();
      }
    });

    $scope.viewSITask = function(sitask) {
      $http.get('/api/tech/sitask/view/' + sitask._id)
        .success(function(sitask) { ModalLauncher.launchSITaskViewModal(sitask); })
        .error(function() { alert('Server error when fetching STS task.'); });

    };

    $scope.viewWalkin = function(id){
      $http.get('/api/technician/walkin/view/'+id)
        .error(function() { alert('Request failed. Please check console for error.'); })
        .success(function(walkin) {
          ModalLauncher.launchWalkinViewModal(walkin);
        });
    };
  }
]);
