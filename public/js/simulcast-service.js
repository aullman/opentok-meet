// Asynchronous fetching of the room. This is so that the mobile app can use the
// same controller. It doesn't know the room straight away
opentokMeet.factory('SimulcastService', ['debounce', '$rootScope',
  function(debounce, $rootScope) {
    return {
      init: function(streams, session) {
        $rootScope.$on('otLayoutComplete', debounce(function () {
          // We have just done a layout, let's update the maxResolution of the Subscribers
          streams.forEach(function (stream) {
            var subscribers = session.getSubscribersForStream(stream);
            subscribers.forEach(function (subscriber) {
              var $subscriber = $('#' + subscriber.id),
                width = $subscriber.width(),
                height = $subscriber.height();
              subscriber.setPreferredResolution({
                width: width,
                height: height
              });
              if (width >= 320 && height >= 240) {
                subscriber.setPreferredFrameRate(30);
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
