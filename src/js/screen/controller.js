// Controller for the standalone screen application /:room/screen
angular.module('opentok-meet').controller(
  'ScreenCtrl',
  ['$scope', 'RoomService', 'OTSession',
    function ScreenCtrl($scope, RoomService, OTSession) {
      RoomService.getRoom().then((roomData) => {
        OTSession.init(roomData.apiKey, roomData.sessionId, roomData.token);
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
  ] // eslint-disable-line comma-dangle
);
