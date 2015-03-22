var helper = require('./firefox-helper.js');

exports.config = {
  allScriptsTimeout: 11000,
  directConnect: true,

  specs: [
    'e2e/*.js'
  ],

  baseUrl: 'https://adam.local:5000/',

  getMultiCapabilities: helper.getFirefoxProfile,

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
