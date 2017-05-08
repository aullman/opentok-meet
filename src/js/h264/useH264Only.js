'use strict';

module.exports = function useH264Only(sdp) {
  var lines = sdp.split('\r\n');

  var mLineIndex = lines.findIndex(function(line) {
    return line.indexOf('m=video') === 0;
  });

  var mLine = lines[mLineIndex];

  var payloadTypes = function () {
    var match = mLine.match(/[0-9][0-9 ]*$/);

    if (!match) {
      return [];
    }

    return match[0].split(' ');
  }();

  var h264Lines = lines.filter(function(line) {
    return /^a=rtpmap.* H264/.test(line);
  });

  if (h264Lines.length === 0) {
    console.warn('No H264 found. Returning original SDP.');
    return sdp;
  }

  var h264TypeCodes = null;

  try {
    h264TypeCodes = h264Lines.map(function(line) {
      return line.split(':')[1].split(' ')[0];
    });
  } catch (error) {
    console.error('Something went wrong getting the h264 type code:', {
      line: h264Lines[0],
      error: error
    });

    return sdp;
  }

  var newPayloadTypes = h264TypeCodes;
  var oldPayloadTypes = payloadTypes.filter(function(type) {
    return h264TypeCodes.indexOf(type) === -1;
  });

  var newMLine = lines[mLineIndex].replace(payloadTypes.join(' '), newPayloadTypes.join(' '));
  lines[mLineIndex] = newMLine;

  return lines.filter(function(line) {
    return !new RegExp('^a=[a-z-]*:(' + oldPayloadTypes.join('|') + ') ').test(line);
  }).join('\r\n');
};
