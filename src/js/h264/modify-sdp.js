module.exports = function(h264, dtx) {
  console.log('Intercept settings', dtx, h264);

  var OrigPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection;
  if (OrigPeerConnection) {
    var newPeerConnection = function(config, constraints) {
        console.log('PeerConnection created with config', config);

        var pc = new OrigPeerConnection(config, constraints);
        var origSetRemoteDescription = pc.setRemoteDescription.bind(pc);
        pc.setRemoteDescription = function(sdp) {
          console.log('Intercept setRemoteDescription');
          if (dtx) {
            sdp.sdp = sdp.sdp.replace('useinbandfec=1', 'useinbandfec=1;usedtx=1');
          }
          return origSetRemoteDescription.apply(this, arguments);
        };
        var origSetLocalDescription = pc.setLocalDescription.bind(pc);
        pc.setLocalDescription = function(sdp) {
          console.log('Intercept setLocalDescription');
          if (h264) {
            var oldSDP = sdp.sdp;
            sdp.sdp = sdp.sdp.replace('120 121 126 97', '126 97 120 121'); // FF
            sdp.sdp = sdp.sdp.replace(/(.*?m=video )(.*?) 100 101 (.*?)107(.*?)/gi,
              '$1$2 107 100 101 $3$4'); // Chrome 56
            sdp.sdp = sdp.sdp.replace(/(.*?m=video )(.*?) 96 98 (.*?)100(.*?)/gi,
              '$1$2 100 96 98 $3$4'); // Chrome Canary
            if (oldSDP === sdp.sdp) {
              console.warn('Could not modify SDP to turn on H.264', oldSDP);
            }
          }
          return origSetLocalDescription.apply(this, arguments);
        };
        return pc;
    };

    ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection'].forEach(function(obj) {
        // Override objects if they exist in the window object
        if (window.hasOwnProperty(obj)) {
            window[obj] = newPeerConnection;
            window[obj].prototype =  newPeerConnection.prototype;
        }
    });
  }
};
