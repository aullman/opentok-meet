window.$ = window.jQuery = require('jquery');
var angular = require('angular');

require('opentok-angular');
require('opentok-whiteboard');
require('opentok-whiteboard/opentok-whiteboard.css');


angular.module('opentok-meet', ['opentok', 'opentok-whiteboard'])
.controller('WhiteboardCtrl', ['$scope', 'RoomService', 'OTSession', function ($scope, RoomService, OTSession) {
    $scope.connected = false;
    // A bit cheeky: Forcing checkSystemRequirements to pass so that this works on mobile
    TB.checkSystemRequirements = function () {
        return true;
    };

    RoomService.getRoom().then(function (roomData) {
        OTSession.init(roomData.apiKey, roomData.sessionId, roomData.token, function (err) {
            if (!err) {
                $scope.$apply(function () {
                    $scope.connected = true;
                });
            }
        });
    });
}]);

require('../services.js');
require('../../css/whiteboard.css');
