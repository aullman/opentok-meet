exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': ['load-extension=/Users/adamu/src/screensharing-extensions/chrome/ScreenSharing/']
    }
  },

  directConnect: true,

  baseUrl: 'https://adam.local:5000/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
