// Asynchronous fetching of the room. This is so that the mobile app can use the
// same controller. It doesn't know the room straight away
angular.module('opentok-meet').factory('SimulcastService', ['debounce', '$rootScope',
  function SimulcastService(debounce, $rootScope) {
    return {
      init(streams, session) {
        $rootScope.$on('otLayoutComplete', debounce(() => {
          // We have just done a layout, let's update the maxResolution of the Subscribers
          streams.forEach((stream) => {
            const subscribers = session.getSubscribersForStream(stream);
            subscribers.forEach((subscriber) => {
              const $subscriber = $(`#${subscriber.id}`);
              const pixelWidth = $subscriber.width() * window.devicePixelRatio;
              const pixelHeight = $subscriber.height() * window.devicePixelRatio;
              subscriber.setPreferredResolution({
                width: pixelWidth,
                height: pixelHeight,
              });
            });
          });
        }, 1000));
      },
    };
  },
]);
