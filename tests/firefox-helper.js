// media.navigator.permission.disabled
// Got this from:
// https://github.com/juliemr/protractor-demo/blob/master/howtos/setFirefoxProfile/helper.js

var q = require('q');
var FirefoxProfile = require('firefox-profile');

exports.getFirefoxProfile = function() {
  var deferred = q.defer();

  var firefoxProfile = new FirefoxProfile();
  firefoxProfile.setPreference('media.navigator.permission.disabled', true);
  firefoxProfile.setPreference('media.getusermedia.screensharing.allowed_domains',
    'localhost,adam.local');
  firefoxProfile.encoded(function(encodedProfile) {
    var multiCapabilities = [{
      browserName: 'firefox',
      //browserVersion: 37,   // For some reason later versions of FF don't acquire a camera
      'browserstack.user' : process.env.BROWSERSTACK_USERNAME,
      'browserstack.key' : process.env.BROWSERSTACK_KEY,
      'browserstack.local' : 'true',
      'os' : 'OS X',
      'os_version' : 'Yosemite',
      acceptSslCert: true,
      'firefox_profile' : encodedProfile
    }];
    deferred.resolve(multiCapabilities);
  });

  return deferred.promise;
};
