function RoomCtrl($scope) {
    $scope.publisher;
    $scope.streams;
    $scope.session;
    $scope.sharingMyScreen = false;
    $scope.shareURL = window.location.href;
    var screenPublisher;
    
    $scope.notMine = function(stream) {
        return stream.connection.connectionId != $scope.session.connection.connectionId;
    };
    
    $scope.shareScreen = function() {
        if (!$scope.sharingMyScreen) {
            $scope.sharingMyScreen = true;
            
            $("layout").append("<div id='myScreen' class='OT_big'></div>");
            
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
                style: {
                    nameDisplayMode: "off"
                },
                mirror: false,
                width: screen.width,
                height: screen.height,
                aspectRatio: screen.width / screen.height
            }).on("publishError", function (err) {
                $scope.$apply($scope.sharingMyScreen = false);
            });

            $scope.session.publish(screenPublisher);

            screenPublisher.on("loaded", function () {
                $scope.$broadcast("layout");
            });
        }
    };
    
    $scope.hideScreen = function() {
        if ($scope.sharingMyScreen) {
            $scope.sharingMyScreen = false;
            
            $scope.session.unpublish(screenPublisher);
            screenPublisher = null;
            $scope.$broadcast("layout");
        }
    };
    
    // It's a bit weird to handle changes in size at this level. Really this should be
    // in the Subscriber Directive but I'm trying not to pollute the generic 
    // Subscriber Directive
    $scope.$on("changeSize", function (event) {
        if (event.targetScope.stream.oth_large === undefined) {
            // If we're a screen we default to large otherwise we default to small
            event.targetScope.stream.oth_large = event.targetScope.stream.name !== "screen";
        } else {
            event.targetScope.stream.oth_large = !event.targetScope.stream.oth_large;
        }
        setTimeout(function () {
            event.targetScope.$emit("layout");
        }, 10);
        setTimeout(function () {
            event.targetScope.$emit("layout");
        }, 5000);
    });
}
