exports.config = {
  allScriptsTimeout: 11000,

  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,

  specs: [
    'e2e/*.js'
  ],

  capabilities: {
    'tunnel-identifier' : process.env.TRAVIS_JOB_NUMBER,
    'name': 'ie11-' + process.env.TRAVIS_BRANCH + '-' + process.env.TRAVIS_PULL_REQUEST,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'browserName': 'internet explorer',
    'platform': 'Windows 8.1',
    'version': '11',
    'prerun': {
      'executable': 'https://dl.dropboxusercontent.com/u/21519477/OpenTokManyCamInstaller2.EXE',
      'background': true,
      'timeout': 120
    }
  },

  params: {
    startDelay: 3000    // Wait 3 seconds to start for the installer to install
  },

  baseUrl: 'https://opentok-meet.herokuapp.com/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000
  }
};
