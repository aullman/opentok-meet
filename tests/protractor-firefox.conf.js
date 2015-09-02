var helper = require('./firefox-helper.js');

exports.config = {
  allScriptsTimeout: 11000,
  directConnect: true,
  firefoxPath: process.env.FIREFOX_BIN,

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
