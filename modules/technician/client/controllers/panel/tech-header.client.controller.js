'use strict';

angular.module('technician').controller('TechHeaderController', ['$scope', '$state', '$http', 'Authentication', 'EmailLauncher', 'ModalLauncher', '$interval', '$rootScope',
  function ($scope, $state, $http, Authentication, EmailLauncher, ModalLauncher, $interval, $rootScope) {
    // Expose view variables
    $scope.notificationCounts = {};
    $scope.$state = $state; $scope.user = Authentication.getUser();
    $scope.user.isAdmin = Authentication.hasAdminPerm();

    $scope.$watch('$state.current', function(toState){
      $scope.breadcrumb = toState.data.breadcrumb;
    });

    $scope.launchCalender = function(studio) {
      ModalLauncher.launchCalendarModal(studio);
    };

    $scope.sendEmail = function() {
      EmailLauncher.launchGeneralEmailModal();
    };

    $scope.createChore = function() {
      ModalLauncher.launchChoreCreateModal();
    };

    $scope.getNotificationCounts = function() {
      var hasNotifications =
        $scope.notificationCounts.announcements !== undefined && 
        $scope.notificationCounts.chores !== undefined &&
        $scope.notificationCounts.checkins !== undefined &&
        ($scope.notificationCounts.announcements !== 0 || 
          $scope.notificationCounts.chores !== 0 || 
          $scope.notificationCounts.checkins !== 0
        );

      $http.get('/api/technician/dashboard/notification/counts')
        .error(function(){
          alert('Server error while retrieving notification counts.');
          $interval.cancel($scope.autoNotificationCountRetriever);
        })
        .success(function(counts) {
          if (!hasNotifications && (counts.announcements || counts.chores || counts.checkins))
            alert('You have new incoming announcements or tasks.');
          $scope.notificationCounts = counts;
        });
    };
    $scope.getNotificationCounts();
    $scope.autoNotificationCountRetriever = $interval(function(){ $scope.getNotificationCounts(); }, 10000);

    // Logout
    $scope.logout = function() {
      $http.get('/api/auth/signout').success(function(){
        delete Authentication.user;

        $rootScope.$on('$locationChangeSuccess', function() {
          $interval.cancel($scope.autoNotificationCountRetriever);
        });

        $state.go('login');
      });
    };
  }
]);
