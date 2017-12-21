const closeToGreen = (r, g, b) => {
  // 86, 246, 61
  if (g > (b * 1.4) && g > (r * 1.4)) {
    return true;
  }
  return false;
};

const getCanvasStream = () => {
  let canvas;
  let cameraVideo;
  let filterVideo;
  let ctx;
  let stopped = false;
  let filterCtx;
  let filterCanvas;
  let cameraCtx;
  let cameraCanvas;

  const drawFrame = () => {
    cameraCtx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
    filterCtx.drawImage(filterVideo, 0, 0, filterCanvas.width, filterCanvas.height);

    const cameraData = cameraCtx.getImageData(0, 0, cameraCanvas.width, cameraCanvas.height);
    const filterData = filterCtx.getImageData(0, 0, filterCanvas.width, filterCanvas.height);
    const res = new Uint8ClampedArray(cameraData.data.length);
    for (let i = 0; i < cameraData.data.length; i += 4) {
      let imgData = cameraData;
      if (!closeToGreen(filterData.data[i], filterData.data[i+1], filterData.data[i+2])) {
        imgData = filterData;
      }
      res[i] = imgData.data[i];
      res[i + 1] = imgData.data[i + 1];
      res[i + 2] = imgData.data[i + 2];
      res[i + 3] = imgData.data[i + 3];
    }
    ctx.putImageData(new ImageData(res, cameraData.width, cameraData.height), 0, 0);
    if (!stopped) {
      requestAnimationFrame(drawFrame);
    } else {
      ctx = null;
    }
  };

  canvas = document.createElement('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = 640;
  canvas.height = 480;

  // Get the Camera video
  OT.getUserMedia({
    audioSource: null
  }).then((stream) => {
    cameraVideo = document.createElement('video');
    cameraVideo.srcObject = stream;
    cameraVideo.play();
    cameraCanvas = document.createElement('canvas');
    cameraCanvas.width = cameraVideo.width = 640;
    cameraCanvas.height = cameraVideo.height = 480;
    cameraCtx = cameraCanvas.getContext('2d');

    requestAnimationFrame(drawFrame);
  });

  // Get the filter video
  filterVideo = document.createElement('video');
  filterVideo.setAttribute('loop', true);
  filterCanvas = document.createElement('canvas');
  filterVideo.src = '/videos/snowflake-greenscreen.mp4';
  filterCanvas.width = filterVideo.width = 640;
  filterCanvas.height = filterVideo.height = 480;
  filterVideo.play();
  filterCtx = filterCanvas.getContext('2d');

  return {
    canvas,
    stop: () => {
      stopped = true;
    }
  };
};

angular.module('opentok-meet').directive('filteredPublisher', ['OTSession', '$rootScope',
  function(OTSession, $rootScope) {
    return {
      restrict: 'E',
      scope: {
        props: '&'
      },
      link: function(scope, element, attrs) {
        var props = scope.props() || {};
        props.width = props.width ? props.width : angular.element(element).width();
        props.height = props.height ? props.height : angular.element(element).height();
        var oldChildren = angular.element(element).children();

        if (scope.canvasStream) {
          scope.canvasStream.stop();
        }
        scope.canvasStream = getCanvasStream();
        props.videoSource = scope.canvasStream.canvas.captureStream(30).getVideoTracks()[0];

        scope.publisher = OT.initPublisher(attrs.apikey || OTSession.session.apiKey,
          element[0], props, function(err) {
            if (err) {
              scope.$emit('otPublisherError', err, scope.publisher);
            }
          });
        // Make transcluding work manually by putting the children back in there
        angular.element(element).append(oldChildren);
        scope.publisher.on({
          accessDenied: function() {
            scope.$emit('otAccessDenied');
          },
          accessDialogOpened: function() {
            scope.$emit('otAccessDialogOpened');
          },
          accessDialogClosed: function() {
            scope.$emit('otAccessDialogClosed');
          },
          accessAllowed: function() {
            angular.element(element).addClass('allowed');
            scope.$emit('otAccessAllowed');
          },
          loaded: function() {
            $rootScope.$broadcast('otLayout');
          },
          streamCreated: function(event) {
            scope.$emit('otStreamCreated', event);
          },
          streamDestroyed: function(event) {
            scope.$emit('otStreamDestroyed', event);
          },
          videoElementCreated: function(event) {
            event.element.addEventListener('resize', function() {
              $rootScope.$broadcast('otLayout');
            });
          }
        });
        scope.$on('$destroy', function() {
          if (OTSession.session) OTSession.session.unpublish(scope.publisher);
          else scope.publisher.destroy();
          if (scope.canvasStream) {
            scope.canvasStream.stop();
          }
          OTSession.publishers = OTSession.publishers.filter(function(publisher) {
            return publisher !== scope.publisher;
          });
          scope.publisher = null;
        });
        if (OTSession.session && (OTSession.session.connected ||
          (OTSession.session.isConnected && OTSession.session.isConnected()))) {
          OTSession.session.publish(scope.publisher, function(err) {
            if (err) {
              scope.$emit('otPublisherError', err, scope.publisher);
            }
          });
        }
        OTSession.addPublisher(scope.publisher);
      }
    };
  }
]);
