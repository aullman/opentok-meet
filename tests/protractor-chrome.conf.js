exports.config = {
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
      'binary': process.env.CHROME_BIN
    }
  },

  directConnect: true,

  baseUrl: 'http://localhost:5000/',

  params: {
    testScreenSharing: false
  },

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
