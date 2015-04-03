/* jasmine specs for controllers go here */
describe('OpenTok Meet controllers', function() {

  describe('RoomCtrl', function() {

    var ctrl,
      scope,
      RoomServiceMock,
      windowMock,
      $httpBackend,
      roomDefer,
      MockOTSession,
      documentMock,
      facePublisher;

    beforeEach(module('opentok-meet'));

    beforeEach(inject(function($controller, $rootScope, $q, $injector) {
      scope = $rootScope.$new();
      scope.session = OT.initSession('mockSessionId');
      scope.session.connection = {
        connectionId: 'mockConnectionId'
      };
      spyOn(scope.session, 'disconnect').and.callThrough();
      RoomServiceMock = {
        changeRoom: jasmine.createSpy('changeRoom'),
        getRoom: function() {
          roomDefer = $q.defer();
          return roomDefer.promise;
        }
      };
      windowMock = jasmine.createSpyObj('$window', ['addEventListener']);
      windowMock.location = {};
      OT.$.eventing(windowMock);  // Add event handling to my mock window
      documentMock = {
        context: {
          body: OT.$.eventing({})
        }
      };
      $httpBackend = $injector.get('$httpBackend');
      MockOTSession = jasmine.createSpyObj('OTSession', ['init']);
      MockOTSession.streams = [];
      MockOTSession.connections = [];
      facePublisher = jasmine.createSpyObj('Publisher', ['publishVideo']);
      facePublisher.id = 'facePublisher';
      MockOTSession.publishers = [{}, facePublisher, {}];
      ctrl = $controller('RoomCtrl', {
        $scope: scope,
        $window: windowMock,
        $document: documentMock,
        $timeout: {},
        OTSession: MockOTSession,
        RoomService: RoomServiceMock,
        baseURL: '',
        mouseMoveTimeoutTime: 10
      });
    }));

    it('should define streams', function () {
      expect(scope.streams).toBe(MockOTSession.streams);
    });

    it('should define connections', function () {
      expect(scope.connections).toBe(MockOTSession.connections);
    });

    it('should define facePublisherProps', function() {
      expect(scope.facePublisherProps).toEqual({
        name: 'face',
        width: '100%',
        height: '100%',
        style: {
          nameDisplayMode: 'off'
        },
        resolution: '1280x720',
        frameRate: 30
      });
    });

    it('should have a notMine method that works', function() {
      expect(scope.notMine).toBeDefined();
      expect(scope.notMine({
        connection: {
          connectionId: 'someOtherConnectionId'
        }
      })).toEqual(true);
      expect(scope.notMine({
        connection: {
          connectionId: 'mockConnectionId'
        }
      })).toEqual(false);
    });

    describe('togglePublish', function() {
      it('publishes with HD properties', function() {
        scope.togglePublish(true);
        expect(scope.publishing).toBe(true);
        expect(scope.facePublisherProps.resolution).toBe('1280x720');
        scope.togglePublish(true);
        expect(scope.publishing).toBe(false);
      });
      it('publishes with SD properties', function() {
        scope.togglePublish(false);
        expect(scope.publishing).toBe(true);
        expect(scope.facePublisherProps.resolution).not.toBeDefined();
      });
    });

    describe('toggleArchiving', function() {
      it('toggles the archiving property', function() {
        expect(scope.archiving).toBe(false);
        scope.toggleArchiving();
        expect(scope.archiving).toBe(true);
        scope.toggleArchiving();
        expect(scope.archiving).toBe(false);
      });
      it('posts to /startArchive and /stopArchive', function() {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(200, '{"archiveId": "mockArchiveId"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiveId).toBe('mockArchiveId');
        expect(scope.archiving).toBe(true);

        $httpBackend.expectPOST('undefined/stopArchive', {
          archiveId: 'mockArchiveId'
        })
          .respond(200, '{"archiveId": "mockArchiveId"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(false);
      });
      it('handles 200 error messages from /startArchive', function() {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(200, '{"error": "mock error"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(false);
      });
      it('handles errors from /startArchive', function() {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(400, '{"error": "mock error"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(false);
      });
      it('handles 200 error messages from /stopArchive', function() {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(200, '{"archiveId": "mockArchiveId"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        $httpBackend.expectPOST('undefined/stopArchive', {
          archiveId: 'mockArchiveId'
        })
          .respond(200, '{"error": "mock error message"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(true);
      });
      it('handles errors from /stopArchive', function() {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(200, '{"archiveId": "mockArchiveId"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        $httpBackend.expectPOST('undefined/stopArchive', {
          archiveId: 'mockArchiveId'
        })
          .respond(400, '{"error": "mock error message"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(true);
      });
    });

    describe('toggleWhiteboard', function () {
      it('toggles showWhiteboard', function () {
        expect(scope.showWhiteboard).toBe(false);
        scope.toggleWhiteboard();
        expect(scope.showWhiteboard).toBe(true);
      });
      it('resets whiteboardUnread', function () {
        scope.whiteboardUnread = true;
        scope.toggleWhiteboard();
        expect(scope.whiteboardUnread).toBe(false);
      });
      it('calls otLayout', function (done) {
        scope.$on('otLayout', function () {
          done();
        });
        scope.toggleWhiteboard();
      });
    });

    describe('toggleEditor', function () {
      it('toggles showEditor', function () {
        expect(scope.showEditor).toBe(false);
        scope.toggleEditor();
        expect(scope.showEditor).toBe(true);
      });
      it('resets editorUnread', function () {
        scope.editorUnread = true;
        scope.toggleEditor();
        expect(scope.editorUnread).toBe(false);
      });
      it('emits otLayout', function (done) {
        scope.$on('otLayout', function () {
          done();
        });
        scope.toggleEditor();
      });
      it('broadcasts otEditorRefresh', function (done) {
        scope.$on('otEditorRefresh', function () {
          done();
        });
        scope.toggleEditor();
      });
    });

    // This is the double click to enlarge functionality
    describe('changeSize', function () {
      it('defaults screens to large', function () {
        scope.stream = {name: 'screen'};
        scope.$emit('changeSize');
        expect(scope.stream.othLarge).toBe(false);
      });
      it('defaults other screens to small', function () {
        scope.stream = {name: 'face'};
        scope.$emit('changeSize');
        expect(scope.stream.othLarge).toBe(true);
      });
      it('emits otLayout', function (done) {
        scope.stream = {name: 'face'};
        scope.$emit('changeSize');
        scope.$on('otLayout', function () {
          done();
        });
      });
    });

    describe('muteVideo', function () {
      var mockSubscriber;
      beforeEach(function () {
        mockSubscriber = jasmine.createSpyObj('Subscriber', ['subscribeToVideo']);
        scope.session.getSubscribersForStream = function () {
          return [mockSubscriber];
        };
      });
      it('toggles stream.videoMuted and calls subscribeToVideo', function () {
        scope.stream = {};
        scope.$emit('muteVideo');
        expect(mockSubscriber.subscribeToVideo).toHaveBeenCalledWith(false);
        expect(scope.stream.videoMuted).toBe(true);
        scope.$emit('muteVideo');
        expect(mockSubscriber.subscribeToVideo).toHaveBeenCalledWith(true);
        expect(scope.stream.videoMuted).toBe(false);
      });
    });

    describe('restrictFrameRate', function () {
      var mockSubscriber;
      beforeEach(function () {
        mockSubscriber = jasmine.createSpyObj('Subscriber', ['restrictFrameRate']);
        scope.session.getSubscribersForStream = function () {
          return [mockSubscriber];
        };
      });
      it('toggles stream.restrictedFrameRate and calls restrictFrameRate', function () {
        scope.stream = {};
        scope.$emit('restrictFrameRate');
        expect(mockSubscriber.restrictFrameRate).toHaveBeenCalledWith(true);
        expect(scope.stream.restrictedFrameRate).toBe(true);
        scope.$emit('restrictFrameRate');
        expect(mockSubscriber.restrictFrameRate).toHaveBeenCalledWith(false);
        expect(scope.stream.restrictedFrameRate).toBe(false);
      });
    });

    describe('RoomService.getRoom()', function () {
      beforeEach(function () {
        roomDefer.resolve({
          p2p: true,
          room: 'testRoom',
          apiKey: 'mockAPIKey',
          sessionId: 'mockSessionId',
          token: 'mockToken'
        });
        scope.$apply();
      });
      it('calls session.disconnect', function () {
        expect(scope.session.disconnect).toHaveBeenCalled();
      });
      it('sets up scope properties', function () {
        expect(scope.p2p).toBe(true);
        expect(scope.room).toBe('testRoom');
        expect(scope.shareURL).toBe('testRoom');
      });
      it('calls OTSession.init', function () {
        expect(MockOTSession.init).toHaveBeenCalledWith('mockAPIKey', 'mockSessionId', 'mockToken',
          jasmine.any(Function));
      });

      describe('OTSession.init', function () {
        var callback,
          mockSession;
        beforeEach(function () {
          callback = MockOTSession.init.calls.mostRecent().args[3];
          
          mockSession = OT.initSession('mockSessionId');
          spyOn(mockSession, 'on').and.callThrough();
          callback(null, mockSession);
        });
        it('sets the session', function () {
          expect(scope.session).toBe(mockSession);
        });
        it('listens for events on the session', function () {
          expect(mockSession.on).toHaveBeenCalledWith('sessionConnected', jasmine.any(Function));
          expect(mockSession.on).toHaveBeenCalledWith('sessionDisconnected', jasmine.any(Function));
          expect(mockSession.on).toHaveBeenCalledWith('archiveStarted archiveStopped',
            jasmine.any(Function));
        });
        it('handles archiveStarted', function (done) {
          mockSession.trigger('archiveStarted', {type: 'archiveStarted', id: 'mockArchiveId'});
          setTimeout(function () {
            expect(scope.archiveId).toBe('mockArchiveId');
            expect(scope.archiving).toBe(true);
            done();
          });
        });
        it('handles archiveStopped', function (done) {
          scope.archiving = true;
          mockSession.trigger('archiveStopped', {type: 'archiveStopped', id: 'mockArchiveId'});
          setTimeout(function () {
            expect(scope.archiveId).toBe('mockArchiveId');
            expect(scope.archiving).toBe(false);
            done();
          });
        });
        it('handles sessionConnected', function (done) {
          expect(scope.connected).toBe(false);
          mockSession.trigger('sessionConnected');
          setTimeout(function () {
            expect(scope.connected).toBe(true);
            done();
          });
        });
        it('handles sessionDisconnected', function (done) {
          scope.connected = true;
          mockSession.trigger('sessionDisconnected');
          setTimeout(function () {
            expect(scope.connected).toBe(false);
            expect(scope.publishing).toBe(false);
            done();
          });
        });
        describe('otEditorUpdate', function () {
          it('updates unread when not looking at editor', function () {
            expect(scope.editorUnread).toBe(false);
            expect(scope.mouseMove).toBe(false);
            scope.$emit('otEditorUpdate');
            expect(scope.editorUnread).toBe(true);
            expect(scope.mouseMove).toBe(true);
          });
          it('does not update unread when already looking at editor', function () {
            scope.showEditor = true;
            expect(scope.editorUnread).toBe(false);
            expect(scope.mouseMove).toBe(false);
            scope.$emit('otEditorUpdate');
            expect(scope.editorUnread).toBe(false);
            expect(scope.mouseMove).toBe(false);
          });
        });
        describe('otWhiteboardUpdate', function () {
          it('updates unread when not looking at whiteboard', function () {
            expect(scope.whiteboardUnread).toBe(false);
            expect(scope.mouseMove).toBe(false);
            scope.$emit('otWhiteboardUpdate');
            expect(scope.whiteboardUnread).toBe(true);
            expect(scope.mouseMove).toBe(true);
          });
          it('does not update unread when already looking at whiteboard', function () {
            scope.showWhiteboard = true;
            expect(scope.whiteboardUnread).toBe(false);
            expect(scope.mouseMove).toBe(false);
            scope.$emit('otWhiteboardUpdate');
            expect(scope.whiteboardUnread).toBe(false);
            expect(scope.mouseMove).toBe(false);
          });
        });
      });
    });

    describe('changeRoom', function () {
      it('calls session.disconnect then waits for sessionDisconnected and then calls changeRoom',
        function (done) {
        scope.changeRoom();
        expect(scope.session.disconnect).toHaveBeenCalled();
        scope.session.trigger('sessionDisconnected');
        setTimeout(function () {
          expect(RoomServiceMock.changeRoom).toHaveBeenCalled();
          done();
        });
      });
    });

    describe('sendEmail', function () {
      it('sets $window.location.url properly', function () {
        scope.shareURL = 'http://mockURL';
        scope.sendEmail();
        expect(windowMock.location.href).toBe('mailto:?subject=Let\'s Meet&body=http://mockURL');
      });
    });

    describe('togglePublishVideo', function () {
      it('toggles publisherVideoMuted and calls publishVideo on the facePublisher', function () {
        expect(scope.publisherVideoMuted).toBe(false);
        scope.togglePublishVideo();
        expect(scope.publisherVideoMuted).toBe(true);
        expect(facePublisher.publishVideo).toHaveBeenCalledWith(false);
        scope.togglePublishVideo();
        expect(scope.publisherVideoMuted).toBe(false);
        expect(facePublisher.publishVideo).toHaveBeenCalledWith(true);
      });
    });

    describe('mouseMove', function () {
      it('gets set to true when the mouse moves', function (done) {
        expect(scope.mouseMove).toBe(false);
        windowMock.trigger('mousemove');
        setTimeout(function () {
          expect(scope.mouseMove).toBe(true);
          done();
        });
      });
      it('goes back to being false after mouseMoveTimeoutTime', function (done) {
        windowMock.trigger('mousemove');
        setTimeout(function () {
          expect(scope.mouseMove).toBe(false);
          done();
        }, 20);
      });
      it('does not go back if you move again', function (done) {
        windowMock.trigger('mousemove');
        setTimeout(function () {
          windowMock.trigger('mousemove');
        }, 5);
        setTimeout(function () {
          expect(scope.mouseMove).toBe(true);
          done();
        }, 11);
      });
      it('gets set to true on touchstart', function (done) {
        expect(scope.mouseMove).toBe(false);
        windowMock.trigger('touchstart');
        setTimeout(function () {
          expect(scope.mouseMove).toBe(true);
          done();
        });
      });
    });

    describe('orientationchange', function () {
      it('causes otLayout to trigger', function (done) {
        scope.$on('otLayout', function () {
          done();
        });
        documentMock.context.body.trigger('orientationchange');
      });
    });

    describe('$destroy', function () {
      it('cleans up', function () {
        scope.connected = true;
        expect(scope.session).toBeDefined();
        var session = scope.session;
        scope.$emit('$destroy');
        expect(scope.session).toBe(null);
        expect(scope.connected).toBe(false);
        expect(session.disconnect).toHaveBeenCalled();
      });
    });
  });
});
