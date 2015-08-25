exports.config = {
  allScriptsTimeout: 11000,

  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,

  specs: [
    'e2e/*.js'
  ],

  capabilities: {
    'name': 'chrome-' + process.env.TRAVIS_BRANCH + '-' + process.env.TRAVIS_PULL_REQUEST,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'tunnel-identifier' : process.env.TRAVIS_JOB_NUMBER,
    'browserName': 'chrome',
    'platform' : 'Windows 8',

    'chromeOptions': {
      'args': ['use-fake-device-for-media-stream', 'use-fake-ui-for-media-stream']
    }
  },

  baseUrl: 'http://localhost:5000/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};
