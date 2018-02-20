const errorReporting = require('../lib/error-reporting.js');

errorReporting();

// eslint-disable-next-line
window.$ = window.jQuery = require('jquery');
const angular = require('angular');

require('opentok-angular');
require('opentok-whiteboard');
require('opentok-whiteboard/opentok-whiteboard.css');


angular.module('opentok-meet', ['opentok', 'opentok-whiteboard'])
  .controller('WhiteboardCtrl', ['$scope', 'RoomService', 'OTSession', function WhiteboardCtrl($scope, RoomService, OTSession) {
    $scope.connected = false;
    // A bit cheeky: Forcing checkSystemRequirements to pass so that this works on mobile
    OT.checkSystemRequirements = () => true;

    RoomService.getRoom().then((roomData) => {
      OTSession.init(roomData.apiKey, roomData.sessionId, roomData.token, (err) => {
        if (!err) {
          $scope.$apply(() => {
            $scope.connected = true;
          });
        }
      });
    });
  }]);

require('../services.js');
require('../../css/whiteboard.css');

require('../safari-electron-redirect.js');
