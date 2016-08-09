// Asynchronous fetching of the room. This is so that the mobile app can use the
// same controller. It doesn't know the room straight away
angular.module('opentok-meet').factory('SimulcastService', ['debounce', '$rootScope',
  function(debounce, $rootScope) {
    return {
      init: function(streams, session) {
        $rootScope.$on('otLayoutComplete', debounce(function () {
          // We have just done a layout, let's update the maxResolution of the Subscribers
          streams.forEach(function (stream) {
            var subscribers = session.getSubscribersForStream(stream);
            subscribers.forEach(function (subscriber) {
              var $subscriber = $('#' + subscriber.id),
                pixelWidth = $subscriber.width() * window.devicePixelRatio,
                pixelHeight = $subscriber.height() * window.devicePixelRatio;
              subscriber.setPreferredResolution({
                width: pixelWidth,
                height: pixelHeight
              });
              if (pixelWidth >= 320 && pixelHeight >= 240) {
                subscriber.setPreferredFrameRate(null);
              } else {
                subscriber.setPreferredFrameRate(15);
              }
            });
          });
        }, 1000));
      }
    };
  }
]);
