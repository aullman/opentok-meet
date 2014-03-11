function RoomCtrl($scope, $http, room) {
    $scope.publisher;
    $scope.streams;
    $scope.session;
    $scope.sharingMyScreen = false;
    $scope.publishing = true;
    $scope.publishHD = true;
    $scope.screenBig = true;
    $scope.archiveId = null;
    $scope.archiving = false;
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
    
    var facePublisherPropsHD = {
        name:'face',
        style: {
            nameDisplayMode: 'off'
        },
        resolution: '1280x720',
        frameRate: 30
    },
    facePublisherPropsSD = {
        name:'face',
        style: {
            nameDisplayMode: 'off'
        }
    };
    $scope.facePublisherProps = facePublisherPropsHD;
    
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
    
    $scope.publishHDChange = function () {
        $scope.publishHD = !$scope.publishHD;
    };
    
    $scope.publish = function () {
        if (!$scope.publishing) {
            $scope.facePublisherProps = $scope.publishHD ? facePublisherPropsHD : facePublisherPropsSD;
            $scope.publishing = true;
        }
    };
    
    $scope.unpublish = function () {
        if ($scope.publishing) {
            $scope.publishing = false;
        }
    };
    
    $scope.startArchiving = function () {
        $scope.archiving = true;
        $http.post('/' + room + '/startArchive').success(function(response) {
            if (response.error) {
                $scope.archiving = false;
                console.error("Failed to start archive", response.error);
            } else {
                $scope.archiveId = response.archiveId;
            }
        }).error(function (data) {
            console.error("Failed to start archiving", data);
            $scope.archiving = false;
        });
    };
    
    $scope.stopArchiving = function () {
        $scope.archiving = false;
        $http.post('/' + room + '/stopArchive', {
            archiveId: $scope.archiveId
        }).success(function(response) {
            if (response.error) {
                console.error("Failed to stop archiving", response.error);
                $scope.archiving = true;
            } else {
                $scope.archiveId = response.archiveId;
            }
        }).error(function (data) {
            console.error("Failed to stop archiving", data);
            $scope.archiving = true;
        });
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
            event.targetScope.$emit("otLayout");
        }, 10);
    });
    
    $scope.$on("changeScreenSize", function (event) {
        $scope.screenBig = !$scope.screenBig;
        setTimeout(function () {
            event.targetScope.$emit("otLayout");
        }, 10);
    });
    
    $scope.$on("sessionConnected", function (event) {
        $scope.session.on("archiveStarted archiveStopped", function (event) {
            // event.id is the archiveId
            $scope.$apply(function () {
                $scope.archiveId = event.id;
                $scope.archiving = (event.type === 'archiveStarted');
            });
        });
    });
}
