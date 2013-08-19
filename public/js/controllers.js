function RoomCtrl($scope) {
    $scope.publisher;
    $scope.streams;
    $scope.session;
    $scope.sharingMyScreen = false;
    var screenPublisher;
    
    $scope.facesFilter = function(stream) {
        return stream.name !== "screen" && stream.connection.connectionId !== $scope.session.connection.connectionId;
    };
    
    $scope.screensFilter = function(stream) {
        return stream.name === "screen";
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
}
