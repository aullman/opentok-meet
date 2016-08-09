/* jasmine specs for controllers go here */
describe('OpenTok Meet Screenshare Only Page', function() {

  describe('ScreenCtrl', function() {

    var ctrl,
      scope,
      RoomServiceMock,
      roomDefer,
      MockOTSession,
      mockSession;

    beforeEach(angular.mock.module('opentok-meet'));

    beforeEach(inject(function($controller, $rootScope, $q) {
      scope = $rootScope.$new();
      OT.checkSystemRequirements = function () {
        // Override checkSystemRequirements so that IE works without a plugin
        return true;
      };
      mockSession = jasmine.createSpyObj('Session', ['disconnect', 'on', 'trigger']);
      mockSession.connection = {
        connectionId: 'mockConnectionId'
      };
      RoomServiceMock = {
        changeRoom: jasmine.createSpy('changeRoom'),
        getRoom: function() {
          roomDefer = $q.defer();
          return roomDefer.promise;
        }
      };
      MockOTSession = jasmine.createSpyObj('OTSession', ['init']);
      MockOTSession.streams = [];
      MockOTSession.connections = [];
      ctrl = $controller('ScreenCtrl', {
        $scope: scope,
        RoomService: RoomServiceMock,
        OTSession: MockOTSession
      });
    }));

    it('defines scope.screenPublisherProps', function () {
      expect(scope.screenPublisherProps).toEqual({
        name: 'screen',
        style: {
          nameDisplayMode: 'off'
        },
        publishAudio: false,
        videoSource: 'screen'
      });
    });

    describe('RoomService.getRoom()', function() {
      var callback;
      beforeEach(function() {
        roomDefer.resolve({
          p2p: true,
          room: 'testRoom',
          apiKey: 'mockAPIKey',
          sessionId: 'mockSessionId',
          token: 'mockToken'
        });
        scope.$apply();
        callback = MockOTSession.init.calls.mostRecent().args[3];
      });
      it('calls OTSession.init', function() {
        expect(MockOTSession.init).toHaveBeenCalledWith('mockAPIKey', 'mockSessionId',
          'mockToken', jasmine.any(Function));
      });
      it('sets connected when the session is connected', function () {
        expect(scope.connected).toBe(false);
        mockSession.connected = true;
        callback(null, mockSession);
        expect(scope.connected).toBe(true);
      });
      it('sets connected on sessionConnected and sessionDisconnected', function (done) {
        expect(scope.connected).toBe(false);
        mockSession.connected = false;
        callback(null, mockSession);
        expect(scope.connected).toBe(false);
        expect(mockSession.on.calls.first().args[0]).toBe('sessionConnected');
        var sessionConnectedHandler = mockSession.on.calls.first().args[1];
        // Execute the sessionConnected Handler
        sessionConnectedHandler();
        expect(scope.connected).toBe(true);
        expect(mockSession.on.calls.mostRecent().args[0]).toBe('sessionDisconnected');
        var sessionDisconnectedHandler = mockSession.on.calls.mostRecent().args[1];
        // Execute the sessionDisconnected Handler
        sessionDisconnectedHandler();
        setTimeout(function () {
          expect(scope.connected).toBe(false);
          done();
        }, 10);
      });
    });
  });
});
