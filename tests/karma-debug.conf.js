module.exports = function(config) {
  config.set({

    basePath: '../',

    files: [
      'https://static.opentok.com/v2/js/opentok.js',
      'public/js/lib/angular/angular.js',
      'public/js/lib/jquery/dist/jquery.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'public/js/lib/opentok-angular/opentok-angular.js',
      'public/js/lib/opentok-editor/opentok-editor.js',
      'public/js/lib/opentok-whiteboard/opentok-whiteboard.js',
      'public/js/*.js',
      'public/js/screen/*.js',
      'public/js/login/*.js',
      'tests/unit/**/*.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-coverage'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

    reporters: ['progress'],

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    }

  });
};
