exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': ['load-extension=/Users/adamu/src/screensharing-extensions/chrome/ScreenSharing/',
        'auto-select-desktop-capture-source="Entire screen"', 'use-fake-device-for-media-stream',
        'use-fake-ui-for-media-stream']
    }
  },

  directConnect: true,

  baseUrl: 'http://adam.local:5000/',

  params: {
    testScreenSharing: true
  },

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
