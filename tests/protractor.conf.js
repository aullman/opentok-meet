const path = require('path');
const fs = require('fs');
const helper = require('./firefox-helper.js');

// Determine the protocol the app is running on
const protocol = (() => {
  const useSSL = fs.existsSync(path.join(__dirname, '..', 'server.key')) &&
    fs.existsSync(path.join(__dirname, '..', 'server.crt'));
  return process.env.HEROKU || !useSSL ? 'http' : 'https';
})();

// Determine the port the app is running on
const port = (() => {
  const appConfigFilePath = path.join(__dirname, '..', 'config.json');
  let p = 5000;
  if (process.env.HEROKU || process.env.TRAVIS) {
    p = process.env.PORT;
  } else if (fs.existsSync(appConfigFilePath)) {
    // eslint-disable-next-line
    p = require(appConfigFilePath).port;
  }
  return p;
})();

// Set the base URL based on the above protocol and port
const baseUrl = `${protocol}://localhost:${port}/`;

function getCapabilitiesFor(browserName, version) {
  const base = {
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    name: `${browserName + version}-${process.env.TRAVIS_BRANCH}-${
      process.env.TRAVIS_PULL_REQUEST}`,
    build: process.env.TRAVIS_BUILD_NUMBER,
    prerun: {
      executable: `${baseUrl}SauceLabsInstaller.exe`,
      background: false,
    },
  };
  // Sauce Labs Supports IE 10 on Windows 8 and IE 11 on Windows 8.1
  base.platform = version === '10' ? 'Windows 8' : 'Windows 8.1';
  base.browserName = browserName === 'ie' ? 'internet explorer' : browserName;
  base.version = version;
  return base;
}
let config;
switch (process.env.BROWSER) {
  case 'ie':
    config = {
      allScriptsTimeout: 30000,

      sauceUser: process.env.SAUCE_USERNAME,
      sauceKey: process.env.SAUCE_ACCESS_KEY,

      specs: [
        'e2e/ie/iesmoketest.js',
      ],

      capabilities: getCapabilitiesFor(process.env.BROWSER, process.env.BVER),

      baseUrl,

      framework: 'jasmine',

      jasmineNodeOpts: {
        defaultTimeoutInterval: 90000,
      },
    };
    break;
  case 'firefox':
    config = {
      allScriptsTimeout: 11000,

      specs: [
        'e2e/*.js',
      ],

      getMultiCapabilities: helper.getFirefoxProfile,

      // seleniumAddress: 'http://hub.browserstack.com/wd/hub',
      directConnect: true,

      keepAlive: true,

      baseUrl,

      firefoxPath: process.env.BROWSERBIN,

      framework: 'jasmine',

      params: {
        testScreenSharing: true,
        phoneNumber: process.env.PHONE_NUMBER || '',
      },

      jasmineNodeOpts: {
        defaultTimeoutInterval: 60000,
      },
    };
    break;
  default:
  case 'chrome':
    config = {
      allScriptsTimeout: 11000,

      specs: [
        'e2e/*.js',
      ],

      capabilities: {
        browserName: 'chrome',
        chromeOptions: {
          args: ['auto-select-desktop-capture-source="Entire screen"',
            'use-fake-device-for-media-stream',
            'use-fake-ui-for-media-stream', 'disable-popup-blocking', '--window-size=800,600'],
          binary: process.env.BROWSERBIN,
        },
      },

      directConnect: true,

      baseUrl,

      params: {
        testScreenSharing: false,
        phoneNumber: process.env.PHONE_NUMBER || '',
      },

      framework: 'jasmine',

      jasmineNodeOpts: {
        defaultTimeoutInterval: 60000,
      },
    };
    break;
}

exports.config = config;
