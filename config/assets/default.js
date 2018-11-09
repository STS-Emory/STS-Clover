'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/font-awesome/css/font-awesome.min.css',
        'public/lib/animate.css/animate.min.css',
        'public/lib/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css',
        'public/lib/checkbox3/dist/checkbox3.min.css',
        'public/lib/datatables/media/css/jquery.dataTables.min.css',
        'public/lib/select2/dist/css/select2.min.css',
        'public/lib/angular-xeditable/dist/css/xeditable.css',
        'public/static/css/style.css',
        'public/static/css/themes/flat-blue.css',
        'public/static/css/promin.css',
        'public/static/css/sts.css'
      ],
      js: [
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/bootstrap/dist/js/bootstrap.min.js',
        'public/lib/bootstrap-switch/dist/jsbootstrap-switch.min.js',
        'public/lib/matchHeight/dist/jquery.matchHeight-min.js',
        'public/lib/datatables/media/js/jquery.dataTables.min.js',
        'public/lib/datatables/media/js/dataTables.bootstrap.min.js',
        'public/lib/select2/dist/js/select2.full.min.js',
        'public/lib/ace-builds/src/ace.js',
        'public/lib/ace-builds/src/mode-html.js',
        'public/lib/ace-builds/src/theme-github.js',
        'public/lib/bootstrap-switch/dist/js/bootstrap-switch.min.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/static/js/jquery.promin.js',

        'public/lib/angular/angular.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-cookies/angular-cookies.min.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-touch/angular-touch.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/angular-ui-utils/ui-utils.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/angular-bootstrap-switch/dist/angular-bootstrap-switch.min.js',
        'public/lib/ng-file-upload/ng-file-upload-shim.min.js',
        'public/lib/ng-file-upload/ng-file-upload.min.js',

        'public/lib/randomcolor/randomColor.js',
        'public/lib/Chart.js/dist/Chart.min.js',
        'public/lib/Chart.js/dist/Chart.bundle.min.js',
        'public/lib/angular-xeditable/dist/js/xeditable.min.js'
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/css/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js',
      'modules/*/client/**/**/*.js'
    ],
    img: [
      'modules/**/*/img/**/*.jpg',
      'modules/**/*/img/**/*.png',
      'modules/**/*/img/**/*.gif',
      'modules/**/*/img/**/*.svg'
    ],
    views: [
      'modules/*/client/views/**/*.html',
      'modules/*/client/views/**/**/*.html'
    ],
    templates: ['build/templates.js']
  },
  server: {
    gruntConfig: ['gruntfile.js'],
    gulpConfig: ['gulpfile.js'],
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: ['modules/*/server/config/*.js'],
    policies: 'modules/*/server/policies/*.js',
    views: ['modules/*/server/views/*.html']
  }
};
