(function() {

  require('./common.js');

  var dtx = getParameterByName('dtx') !== null;
  var h264 = getParameterByName('h264') !== null;

  console.log('Intercept settings', dtx, h264);

  var origPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  if (origPeerConnection) {
    var newPeerConnection = function(config, constraints) {
        console.log('PeerConnection created with config', config);

        var pc = new origPeerConnection(config, constraints);
        var origSetRemoteDescription = pc.setRemoteDescription.bind(pc);
        pc.setRemoteDescription = function(sdp, success, failure) {
          console.log('Intercept setRemoteDescription');
          if (dtx) {
            sdp.sdp = sdp.sdp.replace("useinbandfec=1", "useinbandfec=1;usedtx=1");
          }
          return origSetRemoteDescription(sdp, success, failure);
        };
        var origSetLocalDescription = pc.setLocalDescription.bind(pc);
        pc.setLocalDescription = function(sdp, success, failure) {
          console.log('Intercept setLocalDescription');
          if (h264) {
            sdp.sdp = sdp.sdp.replace("120 121", "121 120"); // FF
            sdp.sdp = sdp.sdp.replace("96 98 100", "100 96 98"); // Chrome
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
})();
