function RoomCtrl($scope, $http, $window, OTSession, room, p2p, apiKey, sessionId, token, baseURL) {
    $scope.streams = OTSession.streams;
    $scope.sharingMyScreen = false;
    $scope.publishing = true;
    $scope.publishHD = true;
    $scope.screenBig = true;
    $scope.archiveId = null;
    $scope.archiving = false;
    $scope.screenShareSupported = !!navigator.webkitGetUserMedia;
    $scope.shareURL = baseURL === '/' ? window.location.href : baseURL + room;
    $scope.connected = false;
    $scope.screenShareFailed = false;
    $scope.mouseMove = false;
    $scope.hungup = false;
    $scope.room = room;
    $scope.p2p = p2p;
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
            $scope.screenShareFailed = false;
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
    
    $scope.hangup = function () {
        if ($scope.session) {
            $scope.hungup = true;
            $scope.session.disconnect();
        }
    };
    
    $scope.connect = function () {
        if ($scope.session) {
            $scope.hungup = false;
            $scope.session.connect(apiKey, token);
        }
    };
    
    $scope.startArchiving = function () {
        $scope.archiving = true;
        $http.post(baseURL + room + '/startArchive').success(function(response) {
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
        $http.post(baseURL + room + '/stopArchive', {
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
    
    $scope.$on("otPublisherError", function (event, error, publisher) {
        if (publisher.id === 'screenPublisher') {
            $scope.$apply(function () {
                $scope.screenShareFailed = true;
                $scope.hideScreen();
            });
        }
    });
    
    OTSession.init(apiKey, sessionId, token, function (err, session) {
        $scope.session = session;
        var connectDisconnect = function (connected) {
            $scope.$apply(function () {
                $scope.connected = connected;
                if (!connected) $scope.publishing = false;
            });
        };
        if (session.connected) connectDisconnect(true);
        $scope.session.on('sessionConnected', connectDisconnect.bind($scope.session, true));
        $scope.session.on('sessionDisconnected', connectDisconnect.bind($scope.session, false));
        $scope.session.on('archiveStarted archiveStopped', function (event) {
              // event.id is the archiveId
              $scope.$apply(function () {
                  $scope.archiveId = event.id;
                  $scope.archiving = (event.type === 'archiveStarted');
              });
        });
    });
    
    var mouseMoveTimeout;
    var mouseMoved = function (event) {
        if (!$scope.mouseMove) {
            $scope.$apply(function () {
                $scope.mouseMove = true;
            });
        }
        if (mouseMoveTimeout) {
            clearTimeout(mouseMoveTimeout);
        }
        mouseMoveTimeout = setTimeout(function () {
            $scope.$apply(function () {
                $scope.mouseMove = false;
            });
        }, 5000);
    };
    $window.addEventListener("mousemove", mouseMoved);
    $window.addEventListener("touchstart", mouseMoved);
}
