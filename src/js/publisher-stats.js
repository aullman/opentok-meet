var publisherStatsHTML = require('./templates/publisher-stats.html');
require('../css/publisher-stats.css');

function PublisherStatsDirective(OTSession, $interval) {
  function link(scope, element, attrs) {
    var currentPublisher = undefined;
    var allLastStats = {};
    var currentInterval;

    function updateStats() {
      currentPublisher.getStats(function(err, allStats) {
        if (err) {
          console.error('Error collecting stats', err);
          return;
        }

        const stats = allStats.map(function(statsContainer) {
          var stats = statsContainer.stats;
          var key = statsContainer.subscriberId || 'Mantis';

          if (!allLastStats[key]) {
            allLastStats[key] = {};
          }

          var lastStats = allLastStats[key];
          var secondsElapsed;
          var currStats = {};

          if (lastStats) {
            secondsElapsed = (stats.timestamp - lastStats.timestamp) / 1000;
          }

          var prettyStats = ['audio', 'video'].reduce(function(accum, type) {
            if (!stats[type]) {
              return accum;
            }
            var moving = ['packetsSent', 'bytesSent', 'packetsLost'].reduce(function(prev, current) {
              if (stats[type][current] === undefined) {
                return prev;
              }
              prev[current] = stats[type][current] - (lastStats[type + ':' + current] || 0);
              lastStats[type + ':' + current] = stats[type][current] || 0;
              return prev;
            }, {});

            moving.packetLoss = ((moving.packetsLost || 0) / (moving.packetsSent || 1)) * 100;
            moving.bitrate = (moving.bytesSent * 8) / (secondsElapsed || 1000);
            accum[type] = moving;
            return accum;
          }, {});

          lastStats.timestamp = stats.timestamp;

          prettyStats.subscriberId = key;
          prettyStats.connectionId = statsContainer.connectionId || 'Mantis';

          if (stats.video) {
            prettyStats.video.frameRate = stats.video.frameRate;
          }

          return prettyStats;
        }).sort(function(a, b) {
          return a.subscriberId < b.subscriberId;
        });

        var generalStats = {
          width: currentPublisher.videoWidth(),
          height: currentPublisher.videoHeight(),
          stats: stats,
        };

        scope.generalStats = generalStats;
      });
    }

    scope.toggleShowStats = function() {
      if (currentInterval) {
        $interval.cancel(currentInterval);
      }

      scope.isShowingStats = !scope.isShowingStats;
      if (scope.isShowingStats) {
        currentInterval = $interval(updateStats, 1000);
      }
    };

    scope.$watch('publisher', (newValue) => {
      if (newValue === undefined) {
        return;
      }

      currentPublisher = newValue;
    });
  };

  return {
    restrict: 'E',
    scope: {
      publisher: '=',
    },
    template: publisherStatsHTML,
    link: link,
  };
}

PublisherStatsDirective.$inject = ['OTSession', '$interval'];

angular.module('opentok-meet').directive('publisherStats', PublisherStatsDirective);
