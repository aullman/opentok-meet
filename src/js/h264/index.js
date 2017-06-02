var getParameterByName = require('./get-parameter-by-name.js');
var modifySDP = require('./modify-sdp.js');

var dtx = getParameterByName('dtx') !== null;
var h264 = getParameterByName('h264') !== null;

var isSafari = navigator.userAgent.indexOf('Safari') !== -1
  && navigator.userAgent.indexOf('Chrome') === -1;

if ((dtx || h264) && !isSafari) {
  modifySDP(h264, dtx);
}
