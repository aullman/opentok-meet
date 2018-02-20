

module.exports = function useH264Only(sdp) {
  const lines = sdp.split('\r\n');

  const mLineIndex = lines.findIndex(line => line.indexOf('m=video') === 0);

  const mLine = lines[mLineIndex];

  const payloadTypes = (() => {
    const match = mLine.match(/[0-9][0-9 ]*$/);

    if (!match) {
      return [];
    }

    return match[0].split(' ');
  })();

  const h264Lines = lines.filter(line => /^a=rtpmap.* H264/.test(line));

  if (h264Lines.length === 0) {
    console.warn('No H264 found. Returning original SDP.');
    return sdp;
  }

  let h264TypeCodes = null;

  try {
    h264TypeCodes = h264Lines.map(line => line.split(':')[1].split(' ')[0]);
  } catch (error) {
    console.error('Something went wrong getting the h264 type code:', {
      line: h264Lines[0],
      error,
    });

    return sdp;
  }

  const newPayloadTypes = h264TypeCodes;
  const oldPayloadTypes = payloadTypes.filter(type => h264TypeCodes.indexOf(type) === -1);

  const newMLine = lines[mLineIndex].replace(payloadTypes.join(' '), newPayloadTypes.join(' '));
  lines[mLineIndex] = newMLine;

  return lines.filter(line => !new RegExp(`^a=[a-z-]*:(${oldPayloadTypes.join('|')}) `).test(line)).join('\r\n');
};
