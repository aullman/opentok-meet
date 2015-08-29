var helper = require('./firefox-helper.js');

exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/scenarios.js'
  ],

  getMultiCapabilities: helper.getFirefoxProfile,

  seleniumAddress: 'http://hub.browserstack.com/wd/hub',

  baseUrl: 'http://localhost:3000/',

  framework: 'jasmine',

  params: {
    testScreenSharing: true
  },

  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};
