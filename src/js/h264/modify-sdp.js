module.exports = function(h264, dtx) {
  console.log('Intercept settings', dtx, h264);

  var OrigPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection;
  if (OrigPeerConnection) {
    var newPeerConnection = function(config, constraints) {
        console.log('PeerConnection created with config', config);

        var pc = new OrigPeerConnection(config, constraints);
        var origSetRemoteDescription = pc.setRemoteDescription.bind(pc);
        pc.setRemoteDescription = function(sdp, success, failure) {
          console.log('Intercept setRemoteDescription');
          if (dtx) {
            sdp.sdp = sdp.sdp.replace('useinbandfec=1', 'useinbandfec=1;usedtx=1');
          }
          return origSetRemoteDescription(sdp, success, failure);
        };
        var origSetLocalDescription = pc.setLocalDescription.bind(pc);
        pc.setLocalDescription = function(sdp, success, failure) {
          console.log('Intercept setLocalDescription');
          if (h264) {
            sdp.sdp = sdp.sdp.replace('120 121 126 97', '126 97 120 121'); // FF
            sdp.sdp = sdp.sdp.replace('100 101 107', '107 100 101'); // Chrome
            sdp.sdp = sdp.sdp.replace('96 98 100', '100 96 98'); // Chrome Canary
          }
          return origSetLocalDescription(sdp, success, failure);
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
