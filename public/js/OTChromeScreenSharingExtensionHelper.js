
// DetectRTC.js - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC
var OTChromeScreenSharingExtensionHelper = function(extensionID) {
  if(!extensionID) {
    throw new Error('initChromeScreenSharingExtensionHelper: extensionID is required.');
  }

  var isChrome = !!navigator.webkitGetUserMedia && typeof chrome !== 'undefined';

  var callbackRegistry = {};

  var isInstalled = void 0;

  // OT.$.uuid()

  var prefix = 'com.tokbox.screenSharing.' + extensionID;
  var request = function(method, payload) {
    var res = { payload: payload, from: 'jsapi' };
    res[prefix] = method;
    return res;
  };

  var addCallback = function(fn, timeToWait) {
    var requestId = OT.$.uuid(),
        timeout;
    callbackRegistry[requestId] = function() {
      clearTimeout(timeout);
      timeout = null;
      fn.apply(null, arguments);
    };
    if(timeToWait) {
      timeout = setTimeout(function() {
        delete callbackRegistry[requestId];
        fn(new Error('Timeout waiting for response to request.'));
      }, timeToWait);
    }
    return requestId;
  };

  var isAvailable = function(callback) {
    if(!callback) {
      throw new Error('isAvailable: callback is required.');
    }

    if(!isChrome) {
      setTimeout(callback.bind(null, false));
    }

    if(isInstalled !== void 0) {
      setTimeout(callback.bind(null, isInstalled));
    } else {
      var requestId = addCallback(function(error, event, payload) {
        if(isInstalled !== true) {
          isInstalled = (event === 'extensionLoaded');
        }
        callback(isInstalled);
      }, 2000);
      var post = request('isExtensionInstalled', { requestId: requestId });
      window.postMessage(post, '*');
    }
  };

  var getVideoSource = function(callback) {
    if(!callback) {
      throw new Error('getSourceId: callback is required');
    }
    isAvailable(function(isInstalled) {
      if(isInstalled) {
        var requestId = addCallback(function(error, event, payload) {
          if(event === 'permissionDenied') {
            callback(new Error('PermissionDeniedError'));
          } else {
            callback(void 0, {
              kind: 'chromeScreenSharing',
              deviceId: payload.sourceId,
              label: 'Screen Sharing'
            });
          }
        });
        window.postMessage(request('getSourceId', { requestId: requestId }), '*');
      } else {
        callback(new Error('Extension is not installed'));
      }
    });
  }

  window.addEventListener('message', function(event) {

    if (event.origin != window.location.origin) {
      return;
    }

    if(!(event.data != null && typeof event.data === 'object')) {
      return;
    }

    if(event.data.from !== 'extension') {
      return;
    }

    var method = event.data[prefix],
        payload = event.data.payload;

    if(payload && payload.requestId) {
      var callback = callbackRegistry[payload.requestId];
      delete callbackRegistry[payload.requestId];
      if(callback) {
        callback(null, method, payload);
      }
    }

    if(method === 'extensionLoaded') {
      isInstalled = true;
    }
  });

  return {
    isAvailable: isAvailable,
    getVideoSource: getVideoSource
  }
};
