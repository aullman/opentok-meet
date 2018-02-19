// media.navigator.permission.disabled
// Got this from:
// https://github.com/juliemr/protractor-demo/blob/master/howtos/setFirefoxProfile/helper.js

const q = require('q');
const FirefoxProfile = require('firefox-profile');

exports.getFirefoxProfile = () => {
  const deferred = q.defer();

  const firefoxProfile = new FirefoxProfile();
  firefoxProfile.setPreference('media.navigator.permission.disabled', true);
  firefoxProfile.setPreference('media.navigator.streams.fake', true);
  firefoxProfile.setPreference(
    'media.getusermedia.screensharing.allowed_domains',
    'localhost,adam.local',
  );
  firefoxProfile.encoded((encodedProfile) => {
    const multiCapabilities = [{
      browserName: 'firefox',
      acceptSslCert: true,
      firefox_profile: encodedProfile,
    }];
    deferred.resolve(multiCapabilities);
  });

  return deferred.promise;
};
