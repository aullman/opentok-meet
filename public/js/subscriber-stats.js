angular.module('opentok-meet').directive('subscriberStats', ['OTSession',
  function(OTSession) {
    return {
      restrict: 'E',
      scope: {
        stream: '='
      },
      template: '<button class="show-stats-btn ion-stats-bars"></button>' +
        '<div class="show-stats-info" ng-show="stats">' +
        'Resolution: {{stats.width}}x{{stats.height}}<br/>' +
        '<div ng-show="stats.audio">' +
        'Audio Packet Loss: {{stats.audioPacketLoss}}%<br/>' +
        'Audio Bitrate: {{stats.audioBitrate}} kbps<br/>' +
        '</div><div ng-show="stats.video">' +
        'Video Packet Loss: {{stats.videoPacketLoss}}%<br/>' +
        'Video Bitrate: {{stats.videoBitrate}} kbps' +
        '</div></div>',
      link: function(scope, element) {
        var lastStats,
          showingStats = false,
          statsInterval;

        var updateStats = function() {
          var subscriber = OTSession.session.getSubscribersForStream(scope.stream)[0];
          if (subscriber) {
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
              if (stats.audio) {
                currStats.audio = stats.audio;
                currStats.audioPacketLoss =
                  ((stats.audio.packetsLost/stats.audio.packetsReceived) * 100).toFixed(2);
                if (lastStats) {
                  var audioBitsReceived = (stats.audio.bytesReceived -
                    (lastStats.audio ? lastStats.audio.bytesReceived : 0)) * 8;
                  currStats.audioBitrate = ((audioBitsReceived / secondsElapsed)/1000).toFixed(0);
                } else {
                  currStats.audioBitrate = '0';
                }
              }
              if (stats.video) {
                currStats.video = stats.video;
                currStats.videoPacketLoss =
                  ((stats.video.packetsLost/stats.video.packetsReceived) * 100).toFixed(2);
                if (lastStats && lastStats) {
                  var videoBitsReceived = (stats.video.bytesReceived -
                    (lastStats.video ? lastStats.video.bytesReceived : 0)) * 8;
                  currStats.videoBitrate = ((videoBitsReceived / secondsElapsed)/1000).toFixed(0);
                } else {
                  currStats.videoBitrate = '0';
                }
              }

              lastStats = currStats;
              if (showingStats) {
                scope.stats = currStats;
                scope.$apply();
              }
            });
          }
        };
        updateStats();

        angular.element(element).find('button').on('mouseover', function() {
          showingStats = true;
          scope.stats = lastStats;
          if (statsInterval) {
            clearInterval(statsInterval);
          }
          statsInterval = setInterval(updateStats, 1000);
          updateStats();
        });
        angular.element(element).on('mouseout', function() {
          showingStats = false;
          scope.stats = null;
          scope.$apply();
          if (statsInterval) {
            clearInterval(statsInterval);
            statsInterval = null;
          }
        });
        scope.$on('$destroy', function() {
          if (statsInterval) {
            clearInterval(statsInterval);
            statsInterval = null;
          }
        });
      }
    };
  }
]);
