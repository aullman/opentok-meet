var helper = require('./firefox-helper.js');

exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  getMultiCapabilities: helper.getFirefoxProfile,

  seleniumAddress: 'http://hub.browserstack.com/wd/hub',

  baseUrl: 'https://localhost:5000/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};
