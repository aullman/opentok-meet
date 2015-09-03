function getCapabilitiesFor(browserName, version) {
  var base = {
    'tunnel-identifier' : process.env.TRAVIS_JOB_NUMBER,
    'name': browserName + version + '-' + process.env.TRAVIS_BRANCH + '-' +
      process.env.TRAVIS_PULL_REQUEST,
    'build': process.env.TRAVIS_BUILD_NUMBER,
    'prerun': {
      'executable': 'http://dl.dropboxusercontent.com/u/21519477/OpenTokManyCamInstaller2.EXE',
      'background': true,
      'timeout': 120
    }
  };
  // Sauce Labs Supports IE 10 on Windows 8 and IE 11 on Windows 8.1
  base.platform = version === '10' ? 'Windows 8' : 'Windows 8.1';
  base.browserName = browserName === 'ie' ? 'internet explorer' : browserName;
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

  capabilities: getCapabilitiesFor(process.env.BROWSER, process.env.BVER),

  baseUrl: 'http://localhost:5000/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 90000
  }
};
