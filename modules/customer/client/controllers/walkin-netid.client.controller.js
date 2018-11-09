'use strict';

angular.module('customer').controller('CustomerWalkinNetIDController', ['$scope', '$state', '$http',
  function ($scope, $state, $http) {
    $scope.status.state = 'netid';
    
    $scope.validate = function () {
      if($scope.walkin.user && $scope.walkin.user.username){
        var username = $scope.walkin.user.username = $scope.walkin.user.username.toLowerCase();
        if(!isNaN(username.charAt(0)) || !(/^\w+$/.test(username)))
          $scope.status.error = 'Please be sure to enter your NetID correctly.\n(Not student number)';
        else {
          $http.get('/api/users/validate/' + username)
            .error(function () { $scope.error = 'System error. Please contact our technician.'; })
            .success(function (user) {

              var entry, formatedUser = { location: 'N/A' };
              if (user.validated && user.isValid) {

                switch (user.level) {
                  case 'Wildcard':
                    $scope.walkin.need2CreateUser = user.user ? false : true;

                    formatedUser.verified = true;
                    formatedUser.isWildcard = true;
                    formatedUser.username = username;
                    break;

                  case 'User':
                    formatedUser = user.user;
                    $scope.walkin.need2CreateUser = false;
                    break;

                  case 'Online Directory':
                    var phone = '', phone_chars = user.directory['Student Phone'].split('');
                    for (var i in phone_chars) {
                      if (phone_chars[i] >= '0' && phone_chars[i] <= '9')
                        phone += phone_chars[i];
                    }
                    if (phone.length == 10)
                      formatedUser.phone = phone;

                    entry = user.entry;
                    $scope.walkin.need2CreateUser = true;

                    formatedUser.verified = true;
                    formatedUser.username = entry.username;
                    formatedUser.lastName = entry.lastName;
                    formatedUser.firstName = entry.firstName;
                    break;

                  case 'User Entry':
                    entry = user.entry;
                    $scope.walkin.need2CreateUser = true;

                    formatedUser.verified = true;
                    formatedUser.username = entry.username;
                    formatedUser.lastName = entry.lastName;
                    formatedUser.firstName = entry.firstName;
                    break;

                  case 'Manual':
                    formatedUser.verified = false;
                    formatedUser.username = username;
                    $scope.walkin.need2CreateUser = true;
                    break;
                }
                $scope.walkin.user = formatedUser;

                if (user.level === 'Wildcard' || !formatedUser.verified)
                  $state.go('customer.walkin.confirm-netid');

                // Query for "Unresolved - Customer will return" tickets
                else if(user.level === 'User' && formatedUser) {
                  $http.get('/api/customer/referenceTicket/'+formatedUser.username)
                    .error(function () { $scope.error = 'System error. Please contact our technician.'; })
                    .success(function(result) {
                      if(!result.found) $state.go('customer.walkin.first-name');
                      else {
                        var ticket;

                        switch (result.type) {
                          case 'walk-in':
                            ticket = {
                              user : result.ticket.user,
                              workNote : result.ticket.workNote,
                              deviceInfo : result.ticket.deviceInfo,
                              deviceCategory : result.ticket.deviceCategory,
                              resolutionType : result.ticket.resolutionType,
                              liabilityAgreement : result.ticket.liabilityAgreement,
                              description : result.ticket.description
                            };
                            break;
                          case 'check-in':
                            ticket = {
                              deviceModel : result.ticket.deviceModel,
                              deviceManufacturer : result.ticket.deviceManufacturer
                            };
                            break;
                          case 'sitask':
                            ticket = {
                              description : result.ticket.description,
                              message : result.ticket.msg_DisplayCustomer
                            };
                            break;
                        }
                        $scope.reference.type = result.type;
                        $scope.reference.ticket = ticket;

                        $state.go('customer.walkin.confirm-reference');
                      }
                    });
                }
                else $state.go('customer.walkin.first-name');
              }
              else $state.go('customer.invalid-user');
            });
        }
      }
      else $scope.status.error = 'Please put in your NetID.';
    };
  }
]);
