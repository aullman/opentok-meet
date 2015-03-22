// media.navigator.permission.disabled
// Got this from:
// https://github.com/juliemr/protractor-demo/blob/master/howtos/setFirefoxProfile/helper.js

var q = require('q');
var FirefoxProfile = require('firefox-profile');

exports.getFirefoxProfile = function() {
  var deferred = q.defer();

  var firefoxProfile = new FirefoxProfile();
  firefoxProfile.setPreference('media.navigator.permission.disabled', true);
  firefoxProfile.encoded(function(encodedProfile) {
    var multiCapabilities = [{
      browserName: 'firefox',
      firefox_profile : encodedProfile
    }];
    deferred.resolve(multiCapabilities);
  });

  return deferred.promise;
};