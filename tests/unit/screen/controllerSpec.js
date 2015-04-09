/* jasmine specs for controllers go here */
describe('OpenTok Meet Screenshare Only Page', function() {

  describe('ScreenCtrl', function() {

    var ctrl,
      scope,
      RoomServiceMock,
      roomDefer,
      MockOTSession;

    beforeEach(module('opentok-meet'));

    beforeEach(inject(function($controller, $rootScope, $q) {
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
      beforeEach(function() {
        roomDefer.resolve({
          p2p: true,
          room: 'testRoom',
          apiKey: 'mockAPIKey',
          sessionId: 'mockSessionId',
          token: 'mockToken'
        });
        scope.$apply();
      });
      it('calls OTSession.init', function() {
        expect(MockOTSession.init).toHaveBeenCalledWith('mockAPIKey', 'mockSessionId',
          'mockToken');
      });

    });
  });
});
