const getParameterByName = require('./get-parameter-by-name.js');
const modifySDP = require('./modify-sdp.js');

const dtx = getParameterByName('dtx') !== null;
const h264 = getParameterByName('h264') !== null;

const isSafari = navigator.userAgent.indexOf('Safari') !== -1
  && navigator.userAgent.indexOf('Chrome') === -1;

if ((dtx || h264) && !isSafari) {
  modifySDP(h264, dtx);
}
