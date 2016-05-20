var webpack = require('webpack');

module.exports = function(config) {
  var sauceLaunchers = {
    'Ie': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: process.env.BVER === '10' ? 'Windows 8' : 'Windows 8.1',
      version: process.env.BVER,
      prerun: {
        executable: 'http://localhost:5000/SauceLabsInstaller.exe',
        background: false
      }
    }
  };
  var browser = process.env.BROWSER || 'chrome';
  config.set({

    basePath: '../',

    files: [
      'https://static.opentok.com/v2/js/opentok.js',
      'tests/unit/**/index.js'
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
      'karma-sauce-launcher',
      'karma-webpack',
      'karma-sourcemap-loader'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

    preprocessors: {
      'src/js/**/*.js': ['sourcemap', 'coverage'],
      'tests/unit/**/index.js': ['webpack', 'sourcemap']
    },

    sauceLabs: {
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },

    client: {
      clearContext: true
    },

    webpack: {
      module: {
          loaders: [
              { test: /\.css$/, loader: 'style!css' }
          ]
      },
      devtool: 'inline-source-map'
    },

    webpackMiddleware: {
      noInfo: true
    },

    reporters: ['progress', 'saucelabs', 'coverage'],

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    }

  });
};
