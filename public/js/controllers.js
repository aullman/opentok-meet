function RoomCtrl($scope) {
    $scope.publisher;
    $scope.streams;
    $scope.session;
    $scope.sharingMyScreen = false;
    $scope.shareURL = window.location.href;
    var screenPublisher;
    
    $scope.facesFilter = function(stream) {
        return stream.name !== "screen";
    };
    
    $scope.screensFilter = function(stream) {
        return stream.name === "screen";
    };
    
    $scope.notMine = function(stream) {
        return stream.connection.connectionId != $scope.session.connection.connectionId;
    };
    
    $scope.shareScreen = function() {
        if (!$scope.sharingMyScreen) {
            $scope.sharingMyScreen = true;
            
            $("layout#screens").append("<div id='myScreen'></div>");
            
            screenPublisher = TB.initPublisher(1127, 'myScreen', {
                publishAudio: false,
                constraints: {
                    video: {
                        mandatory: {
                            chromeMediaSource: "screen",
                            maxWidth: screen.width,
                            maxHeight: screen.height 
                        },
                        optional: []
                    },
                    audio: false
                },
                name: "screen",
                nameDisplayMode: "off",
                mirror: false,
                width: screen.width,
                height: screen.height,
                aspectRatio: screen.width / screen.height
            });

            $scope.session.publish(screenPublisher);
        }
    };
    
    $scope.hideScreen = function() {
        if ($scope.sharingMyScreen) {
            $scope.sharingMyScreen = false;
            
            $scope.session.unpublish(screenPublisher);
            screenPublisher = null;
        }
    };
    
    $scope.$watch(function() {
        return $scope.streams ? $scope.streams.filter($scope.screensFilter).length : 0;
    }, function() {
        setTimeout(function() {
            $scope.$broadcast("layout");
        }, 50);
    });
}
