const useH264Only = require('./useH264Only.js');

module.exports = (h264, dtx) => {
  console.log('Intercept settings', dtx, h264);

  const OrigPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection;
  if (OrigPeerConnection) {
    const newPeerConnection = (config, constraints) => {
      console.log('PeerConnection created with config', config);

      const pc = new OrigPeerConnection(config, constraints);
      const origSetRemoteDescription = pc.setRemoteDescription.bind(pc);
      pc.setRemoteDescription = (sdp) => {
        console.log('Intercept setRemoteDescription');
        if (dtx) {
          sdp.sdp = sdp.sdp.replace('useinbandfec=1', 'useinbandfec=1;usedtx=1');
        }
        return origSetRemoteDescription.apply(this, arguments);
      };
      const origSetLocalDescription = pc.setLocalDescription.bind(pc);
      pc.setLocalDescription = (sdp) => {
        console.log('Intercept setLocalDescription');
        if (h264 && sdp.type === 'offer') {
          const oldSDP = sdp.sdp;
          sdp.sdp = useH264Only(sdp.sdp);
          if (oldSDP === sdp.sdp) {
            console.warn('Could not modify SDP to turn on H.264', oldSDP);
          }
        }
        return origSetLocalDescription.apply(this, arguments);
      };
      return pc;
    };
    newPeerConnection.prototype = OrigPeerConnection.prototype;

    ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection'].forEach((obj) => {
      // Override objects if they exist in the window object
      if (window.hasOwnProperty(obj)) { // eslint-disable-line
        window[obj] = newPeerConnection;
      }
    });
  }
};
