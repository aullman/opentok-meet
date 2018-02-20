angular.module('opentok-meet').controller('RoomCtrl', ['$scope', '$http', '$window', '$document',
  '$timeout', 'OTSession', 'RoomService', 'baseURL', 'SimulcastService', 'NotificationService',
  function RoomCtrl($scope, $http, $window, $document, $timeout, OTSession, RoomService, baseURL,
    SimulcastService, NotificationService) {
    $scope.streams = OTSession.streams;
    $scope.connections = OTSession.connections;
    $scope.publishing = false;
    $scope.archiveId = null;
    $scope.archiving = false;
    $scope.isAndroid = /Android/g.test(navigator.userAgent);
    $scope.connected = false;
    $scope.reconnecting = false;
    $scope.mouseMove = false;
    $scope.showWhiteboard = false;
    $scope.whiteboardUnread = false;
    $scope.showEditor = false;
    $scope.editorUnread = false;
    $scope.showTextchat = false;
    $scope.textChatUnread = false;
    $scope.leaving = false;
    $scope.zoomed = true;
    $scope.bigZoomed = false;
    $scope.layoutProps = {
      animate: true,
      bigFixedRatio: !$scope.bigZoomed,
      fixedRatio: !$scope.zoomed,
    };

    const facePublisherPropsHD = {
      name: 'face',
      width: '100%',
      height: '100%',
      style: {
        nameDisplayMode: 'off',
      },
      usePreviousDeviceSelection: true,
      resolution: '1280x720',
      frameRate: 30,
    };
    const facePublisherPropsSD = {
      name: 'face',
      width: '100%',
      height: '100%',
      style: {
        nameDisplayMode: 'off',
      },
      resolution: '640x480',
    };
    $scope.facePublisherProps = facePublisherPropsHD;

    $scope.notMine = stream =>
      stream.connection.connectionId !== $scope.session.connection.connectionId;

    $scope.getPublisher = id => OTSession.publishers.filter(x => x.id === id)[0];

    $scope.togglePublish = (publishHD) => {
      if (!$scope.publishing) {
      // If they unpublish and publish again then prompt them to change their devices
        facePublisherPropsHD.usePreviousDeviceSelection = false;
        $scope.facePublisherProps = publishHD ? facePublisherPropsHD : facePublisherPropsSD;
      }
      $scope.publishing = !$scope.publishing;
    };

    const startArchiving = () => {
      $scope.archiving = true;
      $http.post(`${baseURL + $scope.room}/startArchive`).then((response) => {
        if (response.data.error) {
          $scope.archiving = false;
          console.error('Failed to start archive', response.data.error);
        } else {
          $scope.archiveId = response.data.archiveId;
        }
      }).catch((response) => {
        console.error('Failed to start archiving', response);
        $scope.archiving = false;
      });
    };

    const stopArchiving = () => {
      $scope.archiving = false;
      $http.post(`${baseURL + $scope.room}/stopArchive`, {
        archiveId: $scope.archiveId,
      }).then((response) => {
        if (response.data.error) {
          console.error('Failed to stop archiving', response.data.error);
          $scope.archiving = true;
        } else {
          $scope.archiveId = response.data.archiveId;
        }
      }).catch((response) => {
        console.error('Failed to stop archiving', response);
        $scope.archiving = true;
      });
    };

    $scope.reportIssue = () => {
      let url = `${'mailto:broken@tokbox.com?subject=Meet%20Issue%20Report&body=' +
      'room: '}${$scope.room
      } p2p: ${$scope.p2p
      }${$scope.session ?
      ` sessionId: ${$scope.session.sessionId
      } connectionId: ${$scope.session.connection ? $scope.session.connection.connectionId : 'none'}`
      : ''}`;
      OT.publishers.forEach((publisher) => {
        if (publisher.stream) {
          url += ` publisher streamId: ${publisher.stream.streamId
          } publisher stream type: ${publisher.stream.videoType}`;
        }
      });
      OT.subscribers.forEach((subscriber) => {
        if (subscriber.stream) {
          url += ` subscriber streamId: ${subscriber.stream.streamId
          } subscriber stream type: ${subscriber.stream.videoType
          } subscriber id: ${subscriber.id}`;
        }
      });
      $window.open(url);
      return false;
    };

    $scope.toggleArchiving = () => {
      if ($scope.archiving) {
        stopArchiving();
      } else {
        startArchiving();
      }
    };

    $scope.toggleWhiteboard = () => {
      $scope.showWhiteboard = !$scope.showWhiteboard;
      $scope.whiteboardUnread = false;
      setTimeout(() => {
        $scope.$broadcast('otLayout');
      }, 10);
    };

    $scope.toggleEditor = () => {
      $scope.showEditor = !$scope.showEditor;
      $scope.editorUnread = false;
      setTimeout(() => {
        $scope.$broadcast('otLayout');
        $scope.$broadcast('otEditorRefresh');
      }, 10);
    };

    $scope.toggleTextchat = () => {
      $scope.showTextchat = !$scope.showTextchat;
      $scope.textChatUnread = false;
    };

    NotificationService.init();

  // Fetch the room info
    RoomService.getRoom().then((roomData) => {
      if ($scope.session) {
        $scope.session.disconnect();
      }
      $scope.p2p = roomData.p2p;
      $scope.room = roomData.room;
      $scope.shareURL = baseURL === '/' ? $window.location.href : baseURL + roomData.room;

      OTSession.init(roomData.apiKey, roomData.sessionId, roomData.token, (err, session) => {
        if (err) {
          $scope.$broadcast('otError', { message: err.message });
          return;
        }
        $scope.session = session;
        const connectDisconnect = (connected) => {
          $scope.$apply(() => {
            $scope.connected = connected;
            $scope.reconnecting = false;
            if (!connected) {
              $scope.publishing = false;
            }
          });
        };
        const reconnecting = (isReconnecting) => {
          $scope.$apply(() => {
            $scope.reconnecting = isReconnecting;
          });
        };
        if ((session.is && session.is('connected')) || session.connected) {
          connectDisconnect(true);
        }
        $scope.session.on('sessionConnected', connectDisconnect.bind($scope.session, true));
        $scope.session.on('sessionDisconnected', connectDisconnect.bind($scope.session, false));
        $scope.session.on('archiveStarted archiveStopped', (event) => {
        // event.id is the archiveId
          $scope.$apply(() => {
            $scope.archiveId = event.id;
            $scope.archiving = (event.type === 'archiveStarted');
          });
        });
        SimulcastService.init($scope.streams, $scope.session);
        $scope.session.on('sessionReconnecting', reconnecting.bind($scope.session, true));
        $scope.session.on('sessionReconnected', reconnecting.bind($scope.session, false));
      });
      const whiteboardUpdated = () => {
        if (!$scope.showWhiteboard && !$scope.whiteboardUnread) {
        // Someone did something to the whiteboard while we weren't looking
          $scope.$apply(() => {
            $scope.whiteboardUnread = true;
            $scope.mouseMove = true; // Show the bottom bar
          });
        }
      };
      const editorUpdated = () => {
        if (!$scope.showEditor && !$scope.editorUnread) {
        // Someone did something to the editor while we weren't looking
          $scope.$apply(() => {
            $scope.editorUnread = true;
            $scope.mouseMove = true; // Show the bottom bar
          });
        }
      };
      const textChatMessage = () => {
        if (!$scope.showTextchat) {
          $scope.textChatUnread = true;
          $scope.mouseMove = true; // Show the bottom bar
          $scope.$apply();
        }
      };
      $scope.$on('otEditorUpdate', editorUpdated);
      $scope.$on('otWhiteboardUpdate', whiteboardUpdated);
      $scope.$on('otTextchatMessage', textChatMessage);
      $scope.publishing = true;
    });

    $scope.$on('changeZoom', (event, expanded) => {
      if (expanded) {
        $scope.bigZoomed = !$scope.bigZoomed;
      } else {
        $scope.zoomed = !$scope.zoomed;
      }
      $scope.layoutProps = {
        animate: true,
        bigFixedRatio: !$scope.bigZoomed,
        fixedRatio: !$scope.zoomed,
      };
      $scope.$broadcast('otLayout');
    });

    $scope.changeRoom = () => {
      if (!$scope.leaving) {
        $scope.leaving = true;
        $scope.session.disconnect();
        $scope.session.on('sessionDisconnected', () => {
          $scope.$apply(() => {
            RoomService.changeRoom();
          });
        });
      }
    };

    $scope.sendEmail = () => {
      $window.location.href = `mailto:?subject=Let's Meet&body=${$scope.shareURL}`;
    };

    let mouseMoveTimeout;
    const mouseMoved = () => {
      if (!$scope.mouseMove) {
        $scope.$apply(() => {
          $scope.mouseMove = true;
        });
      }
      if (mouseMoveTimeout) {
        $timeout.cancel(mouseMoveTimeout);
      }
      mouseMoveTimeout = $timeout(() => {
        $scope.$apply(() => {
          $scope.mouseMove = false;
        });
      }, 5000);
    };
    $window.addEventListener('mousemove', mouseMoved);
    $window.addEventListener('touchstart', mouseMoved);
    $document.context.body.addEventListener('orientationchange', () => {
      $scope.$broadcast('otLayout');
    });

    $scope.$on('$destroy', () => {
      if ($scope.session && $scope.connected) {
        $scope.session.disconnect();
        $scope.connected = false;
      }
      $scope.session = null;
    });
  }]);
