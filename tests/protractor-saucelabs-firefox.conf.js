var helper = require('./firefox-helper.js');

exports.config = {
  allScriptsTimeout: 11000,

  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,

  specs: [
    'e2e/*.js'
  ],

  getMultiCapabilities: helper.getFirefoxProfile,

  baseUrl: 'http://localhost:5000/',

  framework: 'jasmine',

  params: {
    testScreenSharing: true
  },

  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};
