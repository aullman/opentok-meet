function getCapabilitiesFor(platform, browserName, version) {
  var base = {
    'tunnel-identifier' : process.env.TRAVIS_JOB_NUMBER,
    'name': browserName + version + '-' + platform + '-' + process.env.TRAVIS_BRANCH + '-' +
      process.env.TRAVIS_PULL_REQUEST,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'prerun': {
      'executable': 'http://dl.dropboxusercontent.com/u/21519477/OpenTokManyCamInstaller2.EXE',
      'background': true,
      'timeout': 120
    }
  };
  base.platform = platform;
  base.browserName = browserName;
  base.version = version;
  return base;
}

exports.config = {
  allScriptsTimeout: 30000,

  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,

  specs: [
    'e2e/iesmoketest.js'
  ],

  multiCapabilities: [
    getCapabilitiesFor('Windows 8.1', 'internet explorer', '11'),
    getCapabilitiesFor('Windows 8', 'internet explorer', '10')
  ],

  baseUrl: 'http://localhost:5000/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 90000
  }
};
