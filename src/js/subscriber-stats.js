require('../css/subscriber-stats.css');

// StatsService runs on a particular interval and updates the stats for all
// of the subscribers
function SubscriberStats(subscriber, onStats) {
  this.subscriber = subscriber;
  this.onStats = onStats;
  this.lastStats; // The previous getStats result
  this.lastLastStats; // The getStats result before that
}

angular.module('opentok-meet').factory('StatsService', ['$interval',
  function($interval) {
    var interval,
      subscribers = {}; // A collection of SubscriberStats objects keyed by subscriber.id
    var updateStats = function () {
      Object.keys(subscribers).forEach(function (subscriberId) {
        var subscriberStats = subscribers[subscriberId];
        var subscriber = subscriberStats.subscriber,
          lastStats = subscriberStats.lastStats,
          lastLastStats = subscriberStats.lastLastStats;
        subscriber.getStats(function(err, stats) {
          if (err) {
            console.error(err);
            return;
          }
          var currStats = {
            width: subscriber.videoWidth(),
            height: subscriber.videoHeight(),
            timestamp: stats.timestamp
          };
          var secondsElapsed;
          if (lastStats) {
            secondsElapsed = (stats.timestamp - lastStats.timestamp) / 1000;
          }
          var setCurrStats = function(type) {
            currStats[type] = stats[type];
            if (stats[type].packetsReceived > 0) {
              currStats[type + 'PacketLoss'] = ((stats[type].packetsLost /
                stats[type].packetsReceived) * 100).toFixed(2);
            }
            if (lastStats) {
              if (lastLastStats && lastLastStats[type] && lastLastStats[type].packetsReceived &&
                (stats[type].packetsReceived - lastLastStats[type].packetsReceived > 0)) {
                currStats[type + 'PacketLoss'] =
                  (((stats[type].packetsLost - lastLastStats[type].packetsLost)/
                    (stats[type].packetsReceived - lastLastStats[type].packetsReceived)))
                    .toFixed(2);
              }
              var bitsReceived = (stats[type].bytesReceived -
                (lastStats[type] ? lastStats[type].bytesReceived : 0)) * 8;
              currStats[type + 'Bitrate'] = ((bitsReceived / secondsElapsed)/1000).toFixed(0);
            } else {
              currStats[type + 'Bitrate'] = '0';
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
          subscriberStats.onStats(currStats);
        });
      });
    };
    return {
      addSubscriber: function(subscriber, onStats) {
        subscribers[subscriber.id] = new SubscriberStats(subscriber, onStats);
        if (!interval) {
          interval = $interval(updateStats, 2000);
          updateStats();
        }
      },
      removeSubscriber: function(subscriberId) {
        delete subscribers[subscriberId];
        if (Object.keys(subscribers).length === 0) {
          $interval.cancel(interval);
          interval = null;
        }
      }
    };
  }
]);

angular.module('opentok-meet').directive('subscriberStats', ['OTSession', 'StatsService',
  '$timeout', function(OTSession, StatsService, $timeout) {
    return {
      restrict: 'E',
      scope: {
        stream: '='
      },
      template: '<button class="show-stats-btn ion-stats-bars" ' +
        'ng-class="{\'show-stats\': showStats}"></button>' +
        '<div class="show-stats-info" ng-show="showStats">' +
        'Resolution: {{stats.width}}x{{stats.height}}<br/>' +
        '<div ng-show="stats.audio">' +
        'Audio Packet Loss: {{stats.audioPacketLoss}}%<br/>' +
        'Audio Bitrate: {{stats.audioBitrate}} kbps<br/>' +
        '</div><div ng-show="stats.video">' +
        'Video Packet Loss: {{stats.videoPacketLoss}}%<br/>' +
        'Video Bitrate: {{stats.videoBitrate}} kbps<br/>' +
        'Frame Rate: {{stats.video.frameRate || 0}} fps' +
        '</div></div>',
      link: function(scope, element) {
        var subscriber, subscriberId;
        var timeout = $timeout(function () {
          // subscribe hasn't been called yet so we wait a few milliseconds
          subscriber = OTSession.session.getSubscribersForStream(scope.stream)[0];
          subscriber.on('connected', function() {
            subscriberId = subscriber.id;

            StatsService.addSubscriber(subscriber, function (stats) {
              scope.stats = stats;
              scope.$apply();
            });            
          });
        }, 100);

        angular.element(element).find('button').on('click', function() {
          scope.showStats = !scope.showStats;
          subscriber.setStyle({
            buttonDisplayMode: scope.showStats ? 'on' : 'auto'
          });
          scope.$apply();
        });
        scope.$on('$destroy', function() {
          if (subscriberId) {
            StatsService.removeSubscriber(subscriberId);
          }
          $timeout.cancel(timeout);
        });
      }
    };
  }
]);
