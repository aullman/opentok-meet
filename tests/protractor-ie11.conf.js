exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  capabilities: {
    'browserName': 'internet explorer',
    'platform': 'ANY',
    'version': '11',
    'ignoreZoomSetting': true
  },

  seleniumAddress: 'http://ie11.dev:4444/wd/hub',

  baseUrl: 'http://adam.local:5000/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};
