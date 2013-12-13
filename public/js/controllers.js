function RoomCtrl($scope) {
    $scope.publisher;
    $scope.streams;
    $scope.session;
    $scope.sharingMyScreen = false;
    $scope.screenBig = true;
    $scope.shareURL = window.location.href;
    $scope.screenPublisher;
    $scope.screenPublisherProps = {
        name: "screen",
        style:{nameDisplayMode:"off"},
        publishAudio: false,
        constraints: {
            video: {
                mandatory: {
                    chromeMediaSource: "screen",
                    maxWidth: screen.width,
                    minWidth: screen.width,
                    maxHeight: screen.height,
                    minHeight: screen.height,
                    maxFrameRate: 7,
                    minFrameRate: 7
                },
                optional: []
            },
            audio: false
        },
        mirror: false,
        width: screen.width,
        height: screen.height,
        aspectRatio: screen.width / screen.height
    };
    
    $scope.notMine = function(stream) {
        return stream.connection.connectionId != $scope.session.connection.connectionId;
    };
    
    $scope.shareScreen = function() {
        if (!$scope.sharingMyScreen) {
            $scope.sharingMyScreen = true;
        }
    };
    
    $scope.hideScreen = function() {
        if ($scope.sharingMyScreen) {
            $scope.sharingMyScreen = false;
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
    });
    
    $scope.$on("changeScreenSize", function (event) {
        $scope.screenBig = !$scope.screenBig;
        setTimeout(function () {
            event.targetScope.$emit("layout");
        }, 10);
    });
}
