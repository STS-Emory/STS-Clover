'use strict';

angular.module('technician.admin').controller('AdminSettingController', ['$scope', '$http', 'ModalLauncher', '$timeout',
  function ($scope, $http, ModalLauncher, $timeout) {
    // Expose view variables
    $scope.message = {};

    $scope.init = function(){
      $http.get('/templates/setting')
        .success(function(setting){
          $scope.setting = setting;
        })
        .error(function(){ $scope.setting = null; });
    };

    $scope.newScheduler = function(schedulers){
      var name = ModalLauncher.launchDefaultInputModal(
        'New Scheduler Setting',
        'Please enter the name of the scheduler you wish to initialize.',
        'Name of the scheduler here');
      name.result.then(function(response){
        schedulers.push(response);
      });
    };

    $scope.newWildcardNetIDPrefix = function(prefixes){
      var prefix = ModalLauncher.launchDefaultInputModal(
        'New Wildcard NetID Prefix',
        'Please enter the prefix of the wildcard NetID you wish to add.',
        'Prefix of wildcard NetID here');
      prefix.result.then(function(response){
        prefixes.push(response);
      });
    };

    $scope.newLocationOption = function(options){
      var location = ModalLauncher.launchDefaultInputModal(
        'New Location Option',
        'Please enter the name of the location you wish to add.',
        'Name of location NetID here');
      location.result.then(function(response){
        options.push(response);
      });
    };

    $scope.newOSEdition = function(os_extras){
      var os = ModalLauncher.launchDefaultInputModal(
        'New OS edition',
        'Please enter the name of the OS edition you wish to add.',
        'Name of OS edition here');
      os.result.then(function(response){
        os_extras.push(response);
      });
    };

    $scope.changeAdminEmail = function(setting){
      var email = ModalLauncher.launchDefaultInputModal(
        'Change Admin Email',
        'Please enter the new email for Admin. The address is used for recieving notifications from the system.',
        setting.admin_email
      );
      email.result.then(function(response){
        if (response){
          setting.admin_email = response;
        }
      });
    };

    $scope.newCheckinItem = function(items){
      var item = ModalLauncher.launchDefaultInputModal(
        'New Allowed Check-in Item',
        'Please enter the name of the allowed check-in item you wish to add.',
        'Name of check-in item here');
      item.result.then(function(response){
        items.push(response);
      });
    };

    $scope.newDeviceCategory = function(categories){
      var category = ModalLauncher.launchDefaultInputModal(
        'New Computer/Device Category',
        'Please enter the name of the computer/device category you wish to add.',
        'Name of the computer/device category here');
      category.result.then(function(response){
        categories.push({ key: response, values: [] });
      });
    };

    $scope.newDeviceType = function(category){
      var type = ModalLauncher.launchDefaultInputModal(
        'New Computer/Device Type',
        'Please enter the name of the computer/ device type you wish to add.',
        'Name of the computer/device type here');
      type.result.then(function(response){
        category.values.push(response);
      });
    };

    $scope.newTaskTemplate = function(templates){
      var template = {
        name : '',
        task_details: '',
        customer_message: '',
        technician_message: '',
        chore_instruction: ''
      };
      var modal = ModalLauncher.launchTaskTemplateModal(template);
      modal.result.then(function(response){
        if (response){
          templates.push(response);
        }
      });
    };

    $scope.editTaskTemplate = function(index){
      var template = $scope.setting.task_templates[index];
      var modal = ModalLauncher.launchTaskTemplateModal(template);
      modal.result.then(function(response){
        if (response){ 
          $scope.setting.task_templates[index] = response;
        }
      });
    };

    $scope.newCheckInTemplate = function(checkin_templates){
      var template = ModalLauncher.launchDefaultInputModal(
        'New Checkin Template',
        'Please enter the name of this checkin workflow',
        'Name of the checkin workflow here');
      template.result.then(function(response){
        if (response){
          checkin_templates.push({ key: response, values: [] });
        }
      });
    };

    $scope.newCheckInTask = function(option){
      var options = ['At Beginning'];
      for (var i = 0; i < option.values.length; i++){
        options.push('After ' + option.values[i]);
      }
      var task = ModalLauncher.launchInsertModal(
        'New Checkin Task for ' + option.key,
        'Please enter a task for this template',
        'Content of the task here',
        options);
      task.result.then(function(response){
        if (response){
          option.values.splice(response.index, 0, response.data);
        }
      });
    };

    $scope.save = function(){
      $http.put('/templates/setting', $scope.setting)
        .success(function(){
          $scope.message.success = 'Save successfully.'; $scope.init();
          $timeout(function(){ $scope.message.success = undefined; }, 5000);
        })
        .error(function(){
          $scope.message.error = 'Failed to save settings.';
        });
    };

    $scope.reboot = function(){
      var modal = ModalLauncher.launchDefaultMessageModal(
        'Confirm: Reboot',
        'Are you sure you want to reboot this instance?'
      );

      modal.result.then(function (response) {
        if(response){
          $http.get('/reboot')
            .success(window.location.reload())
            .error(function() { alert('Request failed. Please check console for error.'); });
        }
      });
    };
  }
]);
