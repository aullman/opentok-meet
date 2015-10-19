function getCapabilitiesFor(browserName, version) {
  var base = {
    'tunnel-identifier' : process.env.TRAVIS_JOB_NUMBER,
    'name': browserName + version + '-' + process.env.TRAVIS_BRANCH + '-' +
      process.env.TRAVIS_PULL_REQUEST,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'prerun': {
      'executable': 'http://dl.dropboxusercontent.com/u/21519477/OpenTokManyCamInstaller2.EXE',
      'background': true,
      'timeout': 120
    }
  };
  // Sauce Labs Supports IE 10 on Windows 8 and IE 11 on Windows 8.1
  base.platform = version === '10' ? 'Windows 8' : 'Windows 8.1';
  base.browserName = browserName === 'ie' ? 'internet explorer' : browserName;
  base.version = version;
  return base;
}
var config;
switch(process.env.BROWSER) {
  case 'ie':
    config = {
      allScriptsTimeout: 30000,

      sauceUser: process.env.SAUCE_USERNAME,
      sauceKey: process.env.SAUCE_ACCESS_KEY,

      specs: [
        'e2e/iesmoketest.js'
      ],

      capabilities: getCapabilitiesFor(process.env.BROWSER, process.env.BVER),

      baseUrl: 'http://localhost:5000/',

      framework: 'jasmine',

      jasmineNodeOpts: {
        defaultTimeoutInterval: 90000
      }
    };
  break;
  case 'firefox':
    var helper = require('./firefox-helper.js');

    config = {
      allScriptsTimeout: 11000,

      specs: [
        'e2e/scenarios.js'
      ],

      getMultiCapabilities: helper.getFirefoxProfile,

      //seleniumAddress: 'http://hub.browserstack.com/wd/hub',
      directConnect: true,

      baseUrl: 'http://localhost:5000/',

      firefoxPath: process.env.BROWSERBIN,

      framework: 'jasmine',

      params: {
        testScreenSharing: true
      },

      jasmineNodeOpts: {
        defaultTimeoutInterval: 60000
      }
    };
  break;
  default:
  case 'chrome':
    config = {
      allScriptsTimeout: 11000,

      specs: [
        'e2e/scenarios.js'
      ],

      capabilities: {
        'browserName': 'chrome',
        'chromeOptions': {
          'args': ['auto-select-desktop-capture-source="Entire screen"',
            'use-fake-device-for-media-stream',
            'use-fake-ui-for-media-stream'],
          'binary': process.env.BROWSERBIN
        }
      },

      directConnect: true,

      baseUrl: 'http://localhost:5000/',

      params: {
        testScreenSharing: false
      },

      framework: 'jasmine',

      jasmineNodeOpts: {
        defaultTimeoutInterval: 60000
      }
    };
  break;
}
exports.config = config;
