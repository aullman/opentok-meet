module.exports = function(config) {
  var sauceLaunchers = {
    'Ie': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: process.env.BVER === '10' ? 'Windows 8' : 'Windows 8.1',
      version: process.env.BVER
    }
  };
  var browser = process.env.BROWSER || 'chrome';
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

    customLaunchers: sauceLaunchers,

    browsers: [browser[0].toUpperCase() + browser.substr(1)],

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-coverage',
      'karma-sauce-launcher'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

    preprocessors: {
      'public/js/*.js': 'coverage',
      'public/js/screen/*.js': 'coverage'
    },

    sauceLabs: {
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },

    reporters: ['progress', 'saucelabs', 'coverage'],

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    }

  });
};
