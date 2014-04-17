function RoomCtrl($scope, $http, $window, $document, OTSession, RoomService, baseURL) {
    $scope.streams = OTSession.streams;
    $scope.sharingMyScreen = false;
    $scope.publishing = false;
    $scope.publishHD = true;
    $scope.screenBig = true;
    $scope.archiveId = null;
    $scope.archiving = false;
    $scope.screenShareSupported = !!navigator.webkitGetUserMedia;
    $scope.isAndroid = /Android/g.test(navigator.userAgent);
    $scope.connected = false;
    $scope.screenShareFailed = false;
    $scope.mouseMove = false;
    $scope.showWhiteboard = false;
    
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
    
    $scope.toggleShareScreen = function() {
        if (!$scope.sharingMyScreen) {
            $scope.screenShareFailed = false;
        }
        $scope.sharingMyScreen = !$scope.sharingMyScreen;
    };
    
    $scope.publishHDChange = function () {
        $scope.publishHD = !$scope.publishHD;
    };
    
    $scope.togglePublish = function () {
        if (!$scope.publishing) {
            $scope.facePublisherProps = $scope.publishHD ? facePublisherPropsHD : facePublisherPropsSD;
        }
        $scope.publishing = !$scope.publishing;
    };
    
    var startArchiving = function () {
        $scope.archiving = true;
        $http.post(baseURL + $scope.room + '/startArchive').success(function(response) {
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
    
    var stopArchiving = function () {
        $scope.archiving = false;
        $http.post(baseURL + $scope.room + '/stopArchive', {
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
    
    $scope.toggleArchiving = function () {
        if($scope.archiving) stopArchiving();
        else startArchiving();
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
                $scope.toggleShareScreen();
            });
        }
    });
    
    $scope.toggleWhiteboard = function () {
        $scope.showWhiteboard = !$scope.showWhiteboard;
        setTimeout(function () {
            $scope.$emit("otLayout");
        }, 10);
    };
    
    // Fetch the room info
    RoomService.getRoom().then(function (roomData) {
        if ($scope.session) {
            $scope.session.disconnect();
        }
        $scope.p2p = roomData.p2p;
        $scope.room = roomData.room;
        $scope.shareURL = baseURL === '/' ? $window.location.href : baseURL + roomData.room;

        OTSession.init(roomData.apiKey, roomData.sessionId, roomData.token, function (err, session) {
            $scope.session = session;
            var connectDisconnect = function (connected) {
              $scope.$apply(function () {
                  $scope.connected = connected;
                  if (!connected) $scope.publishing = false;
              });
            };
            if (session.is('connected')) connectDisconnect(true);
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
        $scope.publishing = true;
    });
    
    $scope.changeRoom = function () {
        if ($scope.session) {
            $scope.session.disconnect();
            $scope.session = null;
        }
        RoomService.changeRoom();
    };
    
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
    $document.context.body.addEventListener("orientationchange", function () {
      $scope.$emit("otLayout");
    });
}
