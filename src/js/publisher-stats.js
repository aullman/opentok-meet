const publisherStatsHTML = require('../templates/publisher-stats.html');
require('../css/publisher-stats.css');

function PublisherStatsDirective(OTSession, $interval) {
  function link(scope) {
    let currentPublisher;
    const allLastStats = {};
    let currentInterval;

    function updateStats() {
      const hasPublisher = currentPublisher != null;
      const hasGetStats = currentPublisher && typeof currentPublisher.getStats === 'function';

      if (!hasPublisher || !hasGetStats) {
        // no publisher
        $interval.cancel(currentInterval);
        if (!hasGetStats) {
          console.error('Publisher does not have getStats method, use OpenTok JS SDK >= 2.13');
        }
        return;
      }

      currentPublisher.getStats((err, allStats) => {
        if (err) {
          console.error('Error collecting stats', err);
          return;
        }

        const mappedStats = allStats.map((statsContainer) => {
          const { stats } = statsContainer;
          const key = statsContainer.subscriberId || 'Mantis';

          if (!allLastStats[key]) {
            allLastStats[key] = {};
          }

          const lastStats = allLastStats[key];
          let secondsElapsed;

          if (lastStats) {
            secondsElapsed = (stats.timestamp - lastStats.timestamp) / 1000;
          }

          const prettyStats = ['audio', 'video'].reduce((accum, type) => {
            if (!stats[type]) {
              return accum;
            }
            const moving = ['packetsSent', 'bytesSent', 'packetsLost'].reduce((prev, current) => {
              if (stats[type][current] === undefined) {
                return prev;
              }
              prev[current] = stats[type][current] - (lastStats[`${type}:${current}`] || 0);
              lastStats[`${type}:${current}`] = stats[type][current] || 0;
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
        }).sort((a, b) => a.subscriberId < b.subscriberId);

        const generalStats = {
          width: currentPublisher.videoWidth(),
          height: currentPublisher.videoHeight(),
          mappedStats,
        };

        scope.generalStats = generalStats;
      });
    }

    scope.toggleShowStats = () => {
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
  }

  return {
    restrict: 'E',
    scope: {
      publisher: '=',
    },
    template: publisherStatsHTML,
    link,
  };
}

PublisherStatsDirective.$inject = ['OTSession', '$interval'];

angular.module('opentok-meet').directive('publisherStats', PublisherStatsDirective);
