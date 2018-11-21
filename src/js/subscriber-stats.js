require('../css/subscriber-stats.css');
const subscriberStatsHTML = require('../templates/subscriber-stats.html');

// StatsService runs on a particular interval and updates the stats for all
// of the subscribers
function SubscriberStats(subscriber, onStats) {
  this.subscriber = subscriber;
  this.onStats = onStats;
}

angular.module('opentok-meet').factory('StatsService', ['$http', '$interval', 'baseURL', 'room',
  function StatsService($http, $interval, baseURL, room) {
    let interval;
    const subscribers = {}; // A collection of SubscriberStats objects keyed by subscriber.id

    const updateSubscriberStats = (subscriberStats) => {
      const subscriber = subscriberStats.subscriber;
      const lastStats = subscriberStats.lastStats;
      const lastLastStats = subscriberStats.lastLastStats;

      subscriber.getStats((err, stats) => {
        if (err) {
          console.error(err);
          return;
        }
        const currStats = {
          width: subscriber.videoWidth(),
          height: subscriber.videoHeight(),
          timestamp: stats.timestamp,
        };
        let secondsElapsed;
        if (lastStats) {
          secondsElapsed = (stats.timestamp - lastStats.timestamp) / 1000;
        }
        const setCurrStats = (type) => {
          currStats[type] = stats[type];
          if (stats[type].packetsReceived > 0) {
            currStats[`${type}PacketLoss`] = ((stats[type].packetsLost /
                                               stats[type].packetsReceived) * 100).toFixed(2);
          }
          if (lastStats) {
            if (lastLastStats && lastLastStats[type] && lastLastStats[type].packetsReceived &&
                (stats[type].packetsReceived - lastLastStats[type].packetsReceived > 0)) {
              currStats[`${type}PacketLoss`] =
                (((stats[type].packetsLost - lastLastStats[type].packetsLost) /
                  (stats[type].packetsReceived - lastLastStats[type].packetsReceived)))
                  .toFixed(2);
            }
            const bitsReceived = (stats[type].bytesReceived -
                                (lastStats[type] ? lastStats[type].bytesReceived : 0)) * 8;
            currStats[`${type}Bitrate`] = ((bitsReceived / secondsElapsed) / 1000).toFixed(0);
          } else {
            currStats[`${type}Bitrate`] = '0';
          }
        };
        if (stats.audio) {
          setCurrStats('audio');
        }
        if (stats.video) {
          setCurrStats('video');
        }


        subscriberStats.lastLastStats = subscriberStats.lastStats;
        subscriberStats.lastStats = currStats;

        if (subscriberStats.lastLastStats &&
            subscriberStats.lastLastStats.info) {
          // info must be retrieved only once since it does not change
          // for the lifetime of a subscriber.
          const info = subscriberStats.lastLastStats.info;
          subscriberStats.lastStats.info = {
            originServer: info.originServer,
            edgeServer: info.edgeServer,
          };
        }

        ['audio', 'video'].forEach((type) => {
          const key = `${type}Codec`;
          if (subscriberStats[key]) { currStats[key] = subscriberStats[key]; }
        });

        subscriberStats.onStats(currStats);

        if (subscriberStats.lastStats.info) {
          return;
        }

        // The below is only executed on the first call to getStats

        const widgetId = subscriberStats.subscriber.widgetId;
        $http.get(`${baseURL + room}/subscriber/${widgetId}`)
          .then((res) => {
            if (res && res.data && res.data.info) {
              currStats.info = res.data.info;
            } else {
              console.info('received error response  ', res);
            }
          })
          .catch((getErr) => {
            console.trace('failed to retrieve susbcriber info ', getErr);
          });

        // Listen to internal qos events to figure out the audio and video codecs
        const qosHandler = (qos) => {
          if (qos.videoCodec) {
            subscriberStats.videoCodec = qos.videoCodec;
          }
          if (qos.audioCodec) {
            subscriberStats.audioCodec = qos.audioCodec;
          }
        };
        subscriber.on('qos', qosHandler);
      });
    };

    const updateStats = () => {
      Object.keys(subscribers).forEach((subscriberId) => {
        updateSubscriberStats(subscribers[subscriberId]);
      });
    };

    return {
      addSubscriber(subscriber, onStats) {
        const stats = new SubscriberStats(subscriber, onStats);
        subscribers[subscriber.id] = stats;
        if (!interval) {
          interval = $interval(updateStats, 2000);
          updateSubscriberStats(stats);
        }
      },
      removeSubscriber(subscriberId) {
        delete subscribers[subscriberId];
        if (Object.keys(subscribers).length === 0) {
          $interval.cancel(interval);
          interval = null;
        }
      },
    };
  },
]);

angular.module('opentok-meet').directive('subscriberStats', ['OTSession', 'StatsService',
  '$timeout', function subscriberStats(OTSession, StatsService, $timeout) {
    return {
      restrict: 'E',
      scope: {
        stream: '=',
      },
      template: subscriberStatsHTML,
      link(scope, element) {
        let subscriber;
        let subscriberId;
        const timeout = $timeout(() => {
          // subscribe hasn't been called yet so we wait a few milliseconds
          [subscriber] = OTSession.session.getSubscribersForStream(scope.stream);
          subscriber.on('connected', () => {
            subscriberId = subscriber.id;

            StatsService.addSubscriber(subscriber, (stats) => {
              scope.stats = stats;
              scope.$apply();
            });
          });
        }, 100);

        angular.element(element).find('button').on('click', () => {
          scope.showStats = !scope.showStats;
          subscriber.setStyle({
            buttonDisplayMode: scope.showStats ? 'on' : 'auto',
          });
          scope.$apply();
        });
        scope.$on('$destroy', () => {
          if (subscriberId) {
            StatsService.removeSubscriber(subscriberId);
          }
          $timeout.cancel(timeout);
        });
      },
    };
  },
]);
