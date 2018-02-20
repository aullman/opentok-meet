// Controller for the standalone screen application /:room/screen
angular.module('opentok-meet').controller(
  'ScreenCtrl',
  ['$scope', 'RoomService', 'OTSession',
    function ScreenCtrl($scope, RoomService, OTSession) {
      $scope.connected = false;
      RoomService.getRoom().then((roomData) => {
        OTSession.init(roomData.apiKey, roomData.sessionId, roomData.token, (err, session) => {
          if (err) {
            throw new Error(err);
          }
          const connectDisconnect = (connected) => {
            $scope.connected = connected;
            $scope.$apply();
          };
          if ((session.is && session.is('connected')) || session.connected) {
            connectDisconnect(true);
          }
          session.on('sessionConnected', connectDisconnect.bind(session, true));
          session.on('sessionDisconnected', connectDisconnect.bind(session, false));
        });
      });
      $scope.screenPublisherProps = {
        name: 'screen',
        style: {
          nameDisplayMode: 'off',
        },
        publishAudio: false,
        videoSource: 'screen',
      };
    },
  ]
);
