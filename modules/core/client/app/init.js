'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false }).hashPrefix('!');
    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(
  function ($rootScope, $state, Authentication, editableOptions, editableThemes) {
    // Init angular-xeditable options
    editableOptions.theme = 'bs3';
    editableThemes.bs3.inputClass = 'input-xs';
    editableThemes.bs3.buttonsClass = 'btn-xs';
    editableThemes.bs3.controlsTpl = '<div class="editable-controls controls control-group" style="margin-left: 1em;"></div>';

    // Check authentication before changing state
    $rootScope.$on('$stateChangeStart', function (event, toState) {
      if(toState.name){
        if(toState.name.startsWith('tech') && !Authentication.hasTechnicianPerm()){
          event.preventDefault(); $state.go('login');
        }
        else if(toState.name.startsWith('admin') && !Authentication.hasAdminPerm()){
          event.preventDefault(); $state.go('tech.home');
        }
        else return true;
      }
    });

    // Record previous state
    /*
      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        storePreviousState(fromState, fromParams);
      });

      // Store previous state
      function storePreviousState(state, params) {
        // only store this state if it shouldn't be ignored
        if (!state.data || !state.data.ignoreState) {
          $state.previous = {
            state: state,
            params: params,
            href: $state.href(state, params)
          };
        }
      }
    */
  });

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
