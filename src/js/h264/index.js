var getParameterByName = require('./get-parameter-by-name.js');
var modifySDP = require('./modify-sdp.js');

var dtx = getParameterByName('dtx') !== null;
var h264 = getParameterByName('h264') !== null;

if (dtx || h264) {
  modifySDP(h264, dtx);
}
