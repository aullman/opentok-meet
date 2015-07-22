angular.module('opentok-meet').directive('subscriberStats', ['OTSession',
  function(OTSession) {
    return {
      restrict: 'E',
      scope: {
        stream: '='
      },
      template: '<button class="show-stats-btn ion-stats-bars"></button>' +
        '<div class="show-stats-info" ng-show="stats">' +
        'Resolution: {{stats.width}}x{{stats.height}}<br>' +
        'Audio Packet Loss: {{stats.audioPacketLoss}}%<br>' +
        'Audio Bitrate: {{stats.audioBitrate}} kbps<br>' +
        'Video Packet Loss: {{stats.videoPacketLoss}}%<br>' +
        'Video Bitrate: {{stats.videoBitrate}} kbps' +
        '</div>',
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
              var audioPacketLoss = (stats.audio.packetsLost/stats.audio.packetsReceived) * 100,
                videoPacketLoss = (stats.video.packetsLost/stats.video.packetsReceived) * 100,
                audioBitsPerSecond = 0,
                videoBitsPerSecond = 0;
              if (lastStats) {
                var audioBitsReceived = (stats.audio.bytesReceived -
                  lastStats.audio.bytesReceived) * 8,
                  secondsElapsed = (stats.timestamp - lastStats.timestamp) / 1000,
                  videoBitsReceived = (stats.video.bytesReceived -
                    lastStats.video.bytesReceived) * 8;
                audioBitsPerSecond = audioBitsReceived / secondsElapsed;
                videoBitsPerSecond = videoBitsReceived / secondsElapsed;
              }

              lastStats = {
                width: subscriber.videoWidth(),
                height: subscriber.videoHeight(),
                audio: stats.audio,
                video: stats.video,
                audioPacketLoss: audioPacketLoss.toFixed(2),
                videoPacketLoss: videoPacketLoss.toFixed(2),
                audioBitrate: (audioBitsPerSecond / 1000).toFixed(0),
                videoBitrate: (videoBitsPerSecond / 1000).toFixed(0),
                timestamp: stats.timestamp
              };
              if (showingStats) {
                scope.stats = lastStats;
                scope.$apply();
              }
            });
          }
        };
        updateStats();

        angular.element(element).find('button').on('mouseover', function() {
          showingStats = true;
          scope.stats = lastStats;
          if (statsInterval) clearInterval(statsInterval);
          statsInterval = setInterval(updateStats, 1000);
          updateStats();
        });
        angular.element(element).on('mouseout', function() {
          showingStats = false;
          scope.stats = null;
          scope.$apply();
          if (statsInterval) clearInterval(statsInterval);
          statsInterval = null;
        });
      }
    };
  }
]);
