var helper = require('./firefox-helper.js');

exports.config = {
  allScriptsTimeout: 11000,
  directConnect: true,

  specs: [
    'e2e/scenarios.js'
  ],

  baseUrl: 'http://localhost:5000/',

  getMultiCapabilities: helper.getFirefoxProfile,

  params: {
    testScreenSharing: true
  },

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
