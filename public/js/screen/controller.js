// Controller for the standalone screen application /:room/screen
angular.module('opentok-meet').controller('ScreenCtrl',
  ['$scope', 'RoomService', 'OTSession',
  function($scope, RoomService, OTSession) {
    $scope.connected = false;
    RoomService.getRoom().then(function(roomData) {
      OTSession.init(roomData.apiKey, roomData.sessionId, roomData.token, function(err, session) {
        if (err) {
          throw new Error(err);
        }
        var connectDisconnect = function(connected) {
          $scope.connected = connected;
          $scope.$apply();
        };
        if ((session.is && session.is('connected')) || session.connected) {
          connectDisconnect(true);
        }
        $scope.session.on('sessionConnected', connectDisconnect.bind(session, true));
        $scope.session.on('sessionDisconnected', connectDisconnect.bind(session, false));
      });
    });
    $scope.screenPublisherProps = {
      name: 'screen',
      style: {
        nameDisplayMode: 'off'
      },
      publishAudio: false,
      videoSource: 'screen'
    };
  }
]);
