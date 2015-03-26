angular.module('opentok-meet').controller('RoomCtrl', ['$scope', '$http', '$window', '$document',
    '$timeout', 'OTSession', 'RoomService', 'baseURL', 'chromeExtensionId', 'mouseMoveTimeoutTime',
    function($scope, $http, $window, $document, $timeout, OTSession, RoomService, baseURL,
      chromeExtensionId, mouseMoveTimeoutTime) {
  $scope.streams = OTSession.streams;
  $scope.sharingMyScreen = false;
  $scope.publishing = false;
  $scope.archiveId = null;
  $scope.archiving = false;
  $scope.screenShareSupported = false;
  $scope.isAndroid = /Android/g.test(navigator.userAgent);
  $scope.connected = false;
  $scope.screenShareFailed = null;
  $scope.mouseMove = false;
  $scope.showWhiteboard = false;
  $scope.showEditor = false;
  $scope.whiteboardUnread = false;
  $scope.editorUnread = false;
  $scope.leaving = false;
  $scope.selectingScreenSource = false;
  $scope.promptToInstall = false;

  OT.registerScreenSharingExtension('chrome', chromeExtensionId);
  OT.checkScreenSharingCapability(function(response) {
    $scope.screenShareSupported = response.supported && response.extensionRegistered !== false;
    $scope.$apply();
  });

  $scope.screenPublisherProps = {
    name: 'screen',
    style: {
      nameDisplayMode: 'off'
    },
    publishAudio: false,
    videoSource: 'screen'
  };

  var facePublisherPropsHD = {
    name: 'face',
    width: '100%',
    height: '100%',
    style: {
      nameDisplayMode: 'off'
    },
    resolution: '1280x720',
    frameRate: 30
  },
    facePublisherPropsSD = {
      name: 'face',
      width: '100%',
      height: '100%',
      style: {
        nameDisplayMode: 'off'
      }
    };
  $scope.facePublisherProps = facePublisherPropsHD;

  $scope.notMine = function(stream) {
    return stream.connection.connectionId !== $scope.session.connection.connectionId;
  };

  $scope.toggleShareScreen = function() {
    if (!$scope.sharingMyScreen && !$scope.selectingScreenSource) {
      $scope.selectingScreenSource = true;
      $scope.screenShareFailed = null;

      OT.checkScreenSharingCapability(function(response) {
        if (!response.supported || response.extensionRegistered === false) {
          $scope.screenShareSupported = false;
          $scope.selectingScreenSource = false;
        } else if (response.extensionInstalled === false) {
          $scope.promptToInstall = true;
          $scope.selectingScreenSource = false;
        } else {
          $scope.sharingMyScreen = true;
          $scope.selectingScreenSource = false;
        }
        $scope.$apply();
      });
    } else if ($scope.sharingMyScreen) {
      $scope.sharingMyScreen = false;
    }
  };

  $scope.installScreenshareExtension = function() {
    chrome.webstore.install('https://chrome.google.com/webstore/detail/' + chromeExtensionId,
      function() {
      console.log('successfully installed');
    }, function() {
      console.error('failed to install', arguments);
    });
  };

  $scope.togglePublish = function(publishHD) {
    if (!$scope.publishing) {
      $scope.facePublisherProps = publishHD ? facePublisherPropsHD : facePublisherPropsSD;
    }
    $scope.publishing = !$scope.publishing;
  };

  var startArchiving = function() {
    $scope.archiving = true;
    $http.post(baseURL + $scope.room + '/startArchive').success(function(response) {
      if (response.error) {
        $scope.archiving = false;
        console.error('Failed to start archive', response.error);
      } else {
        $scope.archiveId = response.archiveId;
      }
    }).error(function(data) {
      console.error('Failed to start archiving', data);
      $scope.archiving = false;
    });
  };

  var stopArchiving = function() {
    $scope.archiving = false;
    $http.post(baseURL + $scope.room + '/stopArchive', {
      archiveId: $scope.archiveId
    }).success(function(response) {
      if (response.error) {
        console.error('Failed to stop archiving', response.error);
        $scope.archiving = true;
      } else {
        $scope.archiveId = response.archiveId;
      }
    }).error(function(data) {
      console.error('Failed to stop archiving', data);
      $scope.archiving = true;
    });
  };

  $scope.toggleArchiving = function() {
    if ($scope.archiving) {
      stopArchiving();
    } else {
      startArchiving();
    }
  };

  // This is the double click to enlarge functionality
  // It's a bit weird to handle changes in size at this level. Really this should be
  // in the Subscriber Directive but I'm trying not to pollute the generic 
  // Subscriber Directive
  $scope.$on('changeSize', function(event) {
    if (event.targetScope.stream.othLarge === undefined) {
      // If we're a screen we default to large otherwise we default to small
      event.targetScope.stream.othLarge = event.targetScope.stream.name !== 'screen';
    } else {
      event.targetScope.stream.othLarge = !event.targetScope.stream.othLarge;
    }
    setTimeout(function() {
      event.targetScope.$emit('otLayout');
    }, 10);
  });

  $scope.$on('otPublisherError', function(event, error, publisher) {
    if (publisher.id === 'screenPublisher') {
      $scope.$apply(function() {
        $scope.screenShareFailed = error.message;
        $scope.toggleShareScreen();
      });
    }
  });

  $scope.$on('otStreamDestroyed', function(event) {
    if (event.targetScope.publisher.id === 'screenPublisher') {
      $scope.$apply(function() {
        $scope.sharingMyScreen = false;
      });
    }
  });

  $scope.toggleWhiteboard = function() {
    $scope.showWhiteboard = !$scope.showWhiteboard;
    $scope.whiteboardUnread = false;
    setTimeout(function() {
      $scope.$emit('otLayout');
    }, 10);
  };

  $scope.toggleEditor = function() {
    $scope.showEditor = !$scope.showEditor;
    $scope.editorUnread = false;
    setTimeout(function() {
      $scope.$emit('otLayout');
      $scope.$broadcast('otEditorRefresh');
    }, 10);
  };

  // Fetch the room info
  RoomService.getRoom().then(function(roomData) {
    if ($scope.session) {
      $scope.session.disconnect();
    }
    $scope.p2p = roomData.p2p;
    $scope.room = roomData.room;
    $scope.shareURL = baseURL === '/' ? $window.location.href : baseURL + roomData.room;

    OTSession.init(roomData.apiKey, roomData.sessionId, roomData.token, function(err, session) {
      $scope.session = session;
      var connectDisconnect = function(connected) {
        $scope.$apply(function() {
          $scope.connected = connected;
          if (!connected) {
            $scope.publishing = false;
          }
        });
      };
      if ((session.is && session.is('connected')) || session.connected) {
        connectDisconnect(true);
      }
      $scope.session.on('sessionConnected', connectDisconnect.bind($scope.session, true));
      $scope.session.on('sessionDisconnected', connectDisconnect.bind($scope.session, false));
      $scope.session.on('archiveStarted archiveStopped', function(event) {
        // event.id is the archiveId
        $scope.$apply(function() {
          $scope.archiveId = event.id;
          $scope.archiving = (event.type === 'archiveStarted');
        });
      });
      var whiteboardUpdated = function() {
        if (!$scope.showWhiteboard && !$scope.whiteboardUnread) {
          // Someone did something to the whiteboard while we weren't looking
          $scope.$apply(function() {
            $scope.whiteboardUnread = true;
            $scope.mouseMove = true; // Show the bottom bar
          });
        }
      };
      var editorUpdated = function() {
        if (!$scope.showEditor && !$scope.editorUnread) {
          // Someone did something to the editor while we weren't looking
          $scope.$apply(function() {
            $scope.editorUnread = true;
            $scope.mouseMove = true; // Show the bottom bar
          });
        }
      };
      $scope.$on('otEditorUpdate', editorUpdated);
      $scope.$on('otWhiteboardUpdate', whiteboardUpdated);
    });
    $scope.publishing = true;
  });

  $scope.changeRoom = function() {
    if (!$scope.leaving) {
      $scope.leaving = true;
      $scope.session.disconnect();
      $scope.session.on('sessionDisconnected', function() {
        $scope.$apply(function() {
          RoomService.changeRoom();
        });
      });
    }
  };

  $scope.sendEmail = function() {
    $window.location.href = 'mailto:?subject=Let\'s Meet&body=' + $scope.shareURL;
  };

  var mouseMoveTimeout;
  var mouseMoved = function() {
    if (!$scope.mouseMove) {
      $scope.$apply(function() {
        $scope.mouseMove = true;
      });
    }
    if (mouseMoveTimeout) {
      clearTimeout(mouseMoveTimeout);
    }
    mouseMoveTimeout = setTimeout(function() {
      $scope.$apply(function() {
        $scope.mouseMove = false;
      });
    }, mouseMoveTimeoutTime);
  };
  $window.addEventListener('mousemove', mouseMoved);
  $window.addEventListener('touchstart', mouseMoved);
  $document.context.body.addEventListener('orientationchange', function() {
    $scope.$emit('otLayout');
  });

  $scope.$on('$destroy', function() {
    if ($scope.session && $scope.connected) {
      $scope.session.disconnect();
      $scope.connected = false;
    }
    $scope.session = null;
  });
}]);
