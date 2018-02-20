/* jasmine specs for controllers go here */

describe('OpenTok Meet controllers', () => {
  describe('RoomCtrl', () => {
    let scope;
    let RoomServiceMock;
    let SimulcastServiceMock;
    let windowMock;
    let $httpBackend;
    let roomDefer;
    let MockOTSession;
    let documentMock;
    let facePublisher;
    let $timeout;

    beforeEach(angular.mock.module('opentok-meet'));

    beforeEach(inject(($controller, $rootScope, $q, $injector, _$timeout_) => {
      $timeout = _$timeout_;
      scope = $rootScope.$new();
      // Override checkSystemRequirements so that IE works without a plugin
      OT.checkSystemRequirements = () => true;
      scope.session = jasmine.createSpyObj('Session', ['disconnect', 'on', 'trigger']);
      scope.session.connection = {
        connectionId: 'mockConnectionId',
      };
      RoomServiceMock = {
        changeRoom: jasmine.createSpy('changeRoom'),
        getRoom() {
          roomDefer = $q.defer();
          return roomDefer.promise;
        },
      };
      SimulcastServiceMock = jasmine.createSpyObj('SimulcastService', ['init']);
      windowMock = jasmine.createSpyObj('$window', ['addEventListener', 'open']);
      windowMock.location = {};
      OT.$.eventing(windowMock); // Add event handling to my mock window
      documentMock = {
        context: {
          body: OT.$.eventing({}),
        },
      };
      $httpBackend = $injector.get('$httpBackend');
      MockOTSession = jasmine.createSpyObj('OTSession', ['init']);
      MockOTSession.streams = [];
      MockOTSession.connections = [];
      facePublisher = jasmine.createSpyObj('Publisher', ['publishVideo']);
      facePublisher.id = 'facePublisher';
      MockOTSession.publishers = [{}, facePublisher, {}];
      $controller('RoomCtrl', {
        $scope: scope,
        $window: windowMock,
        $document: documentMock,
        $timeout,
        OTSession: MockOTSession,
        RoomService: RoomServiceMock,
        baseURL: '',
        SimulcastService: SimulcastServiceMock,
      });
    }));

    it('should define streams', () => {
      expect(scope.streams).toBe(MockOTSession.streams);
    });

    it('should define connections', () => {
      expect(scope.connections).toBe(MockOTSession.connections);
    });

    it('should define facePublisherProps', () => {
      expect(scope.facePublisherProps).toEqual({
        name: 'face',
        width: '100%',
        height: '100%',
        style: {
          nameDisplayMode: 'off',
        },
        usePreviousDeviceSelection: true,
        resolution: '1280x720',
        frameRate: 30,
      });
    });

    it('should have a notMine method that works', () => {
      expect(scope.notMine).toBeDefined();
      expect(scope.notMine({
        connection: {
          connectionId: 'someOtherConnectionId',
        },
      })).toEqual(true);
      expect(scope.notMine({
        connection: {
          connectionId: 'mockConnectionId',
        },
      })).toEqual(false);
    });

    describe('togglePublish', () => {
      it('publishes with HD properties', () => {
        scope.togglePublish(true);
        expect(scope.publishing).toBe(true);
        expect(scope.facePublisherProps.resolution).toBe('1280x720');
        expect(scope.facePublisherProps.usePreviousDeviceSelection).toBe(false);
        scope.togglePublish(true);
        expect(scope.publishing).toBe(false);
      });
      it('publishes with SD properties', () => {
        scope.togglePublish(false);
        expect(scope.publishing).toBe(true);
        expect(scope.facePublisherProps.resolution).toBe('640x480');
      });
    });

    describe('toggleArchiving', () => {
      it('toggles the archiving property', () => {
        expect(scope.archiving).toBe(false);
        scope.toggleArchiving();
        expect(scope.archiving).toBe(true);
        scope.toggleArchiving();
        expect(scope.archiving).toBe(false);
      });
      it('posts to /startArchive and /stopArchive', () => {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(200, '{"archiveId": "mockArchiveId"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiveId).toBe('mockArchiveId');
        expect(scope.archiving).toBe(true);

        $httpBackend.expectPOST('undefined/stopArchive', {
          archiveId: 'mockArchiveId',
        })
          .respond(200, '{"archiveId": "mockArchiveId"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(false);
      });
      it('handles 200 error messages from /startArchive', () => {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(200, '{"error": "mock error"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(false);
      });
      it('handles errors from /startArchive', () => {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(400, '{"error": "mock error"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(false);
      });
      it('handles 200 error messages from /stopArchive', () => {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(200, '{"archiveId": "mockArchiveId"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        $httpBackend.expectPOST('undefined/stopArchive', {
          archiveId: 'mockArchiveId',
        })
          .respond(200, '{"error": "mock error message"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(true);
      });
      it('handles errors from /stopArchive', () => {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(200, '{"archiveId": "mockArchiveId"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        $httpBackend.expectPOST('undefined/stopArchive', {
          archiveId: 'mockArchiveId',
        })
          .respond(400, '{"error": "mock error message"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(true);
      });
    });

    describe('toggleWhiteboard', () => {
      it('toggles showWhiteboard', () => {
        expect(scope.showWhiteboard).toBe(false);
        scope.toggleWhiteboard();
        expect(scope.showWhiteboard).toBe(true);
      });
      it('resets whiteboardUnread', () => {
        scope.whiteboardUnread = true;
        scope.toggleWhiteboard();
        expect(scope.whiteboardUnread).toBe(false);
      });
      it('calls otLayout', (done) => {
        scope.$on('otLayout', () => {
          done();
        });
        scope.toggleWhiteboard();
      });
    });

    describe('toggleEditor', () => {
      it('toggles showEditor', () => {
        expect(scope.showEditor).toBe(false);
        scope.toggleEditor();
        expect(scope.showEditor).toBe(true);
      });
      it('resets editorUnread', () => {
        scope.editorUnread = true;
        scope.toggleEditor();
        expect(scope.editorUnread).toBe(false);
      });
      it('emits otLayout', (done) => {
        scope.$on('otLayout', () => {
          done();
        });
        scope.toggleEditor();
      });
      it('broadcasts otEditorRefresh', (done) => {
        scope.$on('otEditorRefresh', () => {
          done();
        });
        scope.toggleEditor();
      });
    });

    describe('RoomService.getRoom()', () => {
      beforeEach(() => {
        roomDefer.resolve({
          p2p: true,
          room: 'testRoom',
          apiKey: 'mockAPIKey',
          sessionId: 'mockSessionId',
          token: 'mockToken',
        });
        scope.$apply();
      });
      it('calls session.disconnect', () => {
        expect(scope.session.disconnect).toHaveBeenCalled();
      });
      it('sets up scope properties', () => {
        expect(scope.p2p).toBe(true);
        expect(scope.room).toBe('testRoom');
        expect(scope.shareURL).toBe('testRoom');
      });
      it('calls OTSession.init', () => {
        expect(MockOTSession.init).toHaveBeenCalledWith('mockAPIKey', 'mockSessionId', 'mockToken', jasmine.any(Function));
      });

      describe('OTSession.init', () => {
        let callback;
        let mockSession;

        it('handles errors', (done) => {
          callback = MockOTSession.init.calls.mostRecent().args[3];
          const fakeError = { message: 'fakeMessage' };
          scope.$on('otError', (event, err) => {
            expect(err.message).toEqual('fakeMessage');
            done();
          });
          callback(fakeError);
        });

        describe('success', () => {
          beforeEach(() => {
            callback = MockOTSession.init.calls.mostRecent().args[3];

            mockSession = OT.initSession('mockSessionId');
            spyOn(mockSession, 'on').and.callThrough();
            callback(null, mockSession);
          });
          it('sets the session', () => {
            expect(scope.session).toBe(mockSession);
          });
          it('sets publishing to true', () => {
            expect(scope.publishing).toBe(true);
            expect(scope.facePublisherProps.resolution).toBe('1280x720');
            expect(scope.facePublisherProps.usePreviousDeviceSelection).toBe(true);
          });
          it('listens for events on the session', () => {
            expect(mockSession.on).toHaveBeenCalledWith('sessionConnected', jasmine.any(Function));
            expect(mockSession.on).toHaveBeenCalledWith('sessionDisconnected', jasmine.any(Function));
            expect(mockSession.on).toHaveBeenCalledWith('archiveStarted archiveStopped', jasmine.any(Function));
            expect(mockSession.on).toHaveBeenCalledWith('sessionReconnecting', jasmine.any(Function));
            expect(mockSession.on).toHaveBeenCalledWith('sessionReconnected', jasmine.any(Function));
          });
          it('handles archiveStarted', (done) => {
            mockSession.trigger('archiveStarted', { type: 'archiveStarted', id: 'mockArchiveId' });
            setTimeout(() => {
              expect(scope.archiveId).toBe('mockArchiveId');
              expect(scope.archiving).toBe(true);
              done();
            }, 100);
          });
          it('handles archiveStopped', (done) => {
            scope.archiving = true;
            mockSession.trigger('archiveStopped', { type: 'archiveStopped', id: 'mockArchiveId' });
            setTimeout(() => {
              expect(scope.archiveId).toBe('mockArchiveId');
              expect(scope.archiving).toBe(false);
              done();
            }, 100);
          });
          it('calls init on SimulcastService', () => {
            expect(SimulcastServiceMock.init).toHaveBeenCalledWith(scope.streams, scope.session);
          });
          it('handles sessionConnected', (done) => {
            expect(scope.connected).toBe(false);
            mockSession.trigger('sessionConnected');
            setTimeout(() => {
              expect(scope.connected).toBe(true);
              done();
            }, 100);
          });
          it('handles sessionDisconnected', (done) => {
            scope.connected = true;
            mockSession.trigger('sessionDisconnected');
            setTimeout(() => {
              expect(scope.connected).toBe(false);
              expect(scope.publishing).toBe(false);
              done();
            }, 100);
          });
          it('handles sessionConnected when reconnecting', (done) => {
            scope.reconnecting = true;
            mockSession.trigger('sessionConnected');
            setTimeout(() => {
              expect(scope.reconnecting).toBe(false);
              done();
            }, 100);
          });
          it('handles sessionDisconnected when reconnecting', (done) => {
            scope.reconnecting = true;
            mockSession.trigger('sessionDisconnected');
            setTimeout(() => {
              expect(scope.reconnecting).toBe(false);
              done();
            }, 100);
          });
          it('handles sessionReconnecting', (done) => {
            expect(scope.reconnecting).toBe(false);
            mockSession.trigger('sessionReconnecting');
            setTimeout(() => {
              expect(scope.reconnecting).toBe(true);
              done();
            }, 100);
          });
          it('handles sessionReconnected', (done) => {
            scope.reconnecting = true;
            mockSession.trigger('sessionReconnected');
            setTimeout(() => {
              expect(scope.reconnecting).toBe(false);
              done();
            }, 100);
          });
          describe('otEditorUpdate', () => {
            it('updates unread when not looking at editor', () => {
              expect(scope.editorUnread).toBe(false);
              expect(scope.mouseMove).toBe(false);
              scope.$emit('otEditorUpdate');
              expect(scope.editorUnread).toBe(true);
              expect(scope.mouseMove).toBe(true);
            });
            it('does not update unread when already looking at editor', () => {
              scope.showEditor = true;
              expect(scope.editorUnread).toBe(false);
              expect(scope.mouseMove).toBe(false);
              scope.$emit('otEditorUpdate');
              expect(scope.editorUnread).toBe(false);
              expect(scope.mouseMove).toBe(false);
            });
          });
          describe('otWhiteboardUpdate', () => {
            it('updates unread when not looking at whiteboard', () => {
              expect(scope.whiteboardUnread).toBe(false);
              expect(scope.mouseMove).toBe(false);
              scope.$emit('otWhiteboardUpdate');
              expect(scope.whiteboardUnread).toBe(true);
              expect(scope.mouseMove).toBe(true);
            });
            it('does not update unread when already looking at whiteboard', () => {
              scope.showWhiteboard = true;
              expect(scope.whiteboardUnread).toBe(false);
              expect(scope.mouseMove).toBe(false);
              scope.$emit('otWhiteboardUpdate');
              expect(scope.whiteboardUnread).toBe(false);
              expect(scope.mouseMove).toBe(false);
            });
          });
        });
        describe('reportIssue', () => {
          beforeEach(() => {
            scope.reportIssue();
          });
          it('calls $window.open with the right values', () => {
            expect(windowMock.open).toHaveBeenCalled();
            const url = windowMock.open.calls.mostRecent().args[0];
            expect(url).toContain('mailto:broken@tokbox.com');
            expect(url).toContain(scope.session.sessionId);
          });
        });
      });
    });

    describe('changeRoom', () => {
      it(
        'calls session.disconnect then waits for sessionDisconnected and then calls changeRoom',
        (done) => {
          scope.changeRoom();
          expect(scope.session.disconnect).toHaveBeenCalled();
          expect(scope.session.on).toHaveBeenCalledWith('sessionDisconnected', jasmine.any(Function));
          const handler = scope.session.on.calls.mostRecent().args[1];
          handler();
          setTimeout(() => {
            expect(RoomServiceMock.changeRoom).toHaveBeenCalled();
            done();
          }, 100);
        }
      );
    });

    describe('zoom', () => {
      it('toggles zoomed and the fixedRatio property', () => {
        expect(scope.zoomed).toBe(true);
        expect(scope.layoutProps.fixedRatio).toBe(false);
        expect(scope.layoutProps.bigFixedRatio).toBe(true);
        scope.$emit('changeZoom', false);
        expect(scope.zoomed).toBe(false);
        expect(scope.layoutProps.fixedRatio).toBe(true);
        expect(scope.layoutProps.bigFixedRatio).toBe(true);
        scope.$emit('changeZoom', false);
        expect(scope.zoomed).toBe(true);
        expect(scope.layoutProps.fixedRatio).toBe(false);
        expect(scope.layoutProps.bigFixedRatio).toBe(true);
        scope.$emit('changeZoom', true);
        expect(scope.layoutProps.fixedRatio).toBe(false);
        expect(scope.layoutProps.bigFixedRatio).toBe(false);
      });
    });

    describe('sendEmail', () => {
      it('sets $window.location.url properly', () => {
        scope.shareURL = 'http://mockURL';
        scope.sendEmail();
        expect(windowMock.location.href).toBe('mailto:?subject=Let\'s Meet&body=http://mockURL');
      });
    });

    describe('mouseMove', () => {
      it('gets set to true when the mouse moves', (done) => {
        expect(scope.mouseMove).toBe(false);
        windowMock.trigger('mousemove');
        setTimeout(() => {
          expect(scope.mouseMove).toBe(true);
          $timeout.flush();
          expect(scope.mouseMove).toBe(false);
          done();
        });
      });
      it('does not go back if you move again', (done) => {
        windowMock.trigger('mousemove');
        setTimeout(() => {
          windowMock.trigger('mousemove');
        }, 5);
        setTimeout(() => {
          expect(scope.mouseMove).toBe(true);
          done();
        }, 11);
      });
      it('gets set to true on touchstart', (done) => {
        expect(scope.mouseMove).toBe(false);
        windowMock.trigger('touchstart');
        setTimeout(() => {
          expect(scope.mouseMove).toBe(true);
          done();
        }, 100);
      });
    });

    describe('orientationchange', () => {
      it('causes otLayout to trigger', (done) => {
        scope.$on('otLayout', () => {
          done();
        });
        documentMock.context.body.trigger('orientationchange');
      });
    });

    describe('$destroy', () => {
      it('cleans up', () => {
        scope.connected = true;
        expect(scope.session).toBeDefined();
        const session = scope.session;
        scope.$emit('$destroy');
        expect(scope.session).toBe(null);
        expect(scope.connected).toBe(false);
        expect(session.disconnect).toHaveBeenCalled();
      });
    });
  });
});
