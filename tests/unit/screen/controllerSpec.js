/* jasmine specs for controllers go here */
describe('OpenTok Meet Screenshare Only Page', () => {
  describe('ScreenCtrl', () => {
    let scope;
    let RoomServiceMock;
    let roomDefer;
    let MockOTSession;

    beforeEach(angular.mock.module('opentok-meet'));

    beforeEach(inject(($controller, $rootScope, $q) => {
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
      MockOTSession = jasmine.createSpyObj('OTSession', ['init']);
      MockOTSession.streams = [];
      MockOTSession.connections = [];
      $controller('ScreenCtrl', {
        $scope: scope,
        RoomService: RoomServiceMock,
        OTSession: MockOTSession,
      });
    }));

    it('defines scope.screenPublisherProps', () => {
      expect(scope.screenPublisherProps).toEqual({
        name: 'screen',
        style: {
          nameDisplayMode: 'off',
        },
        publishAudio: false,
        videoSource: 'screen',
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
      it('calls OTSession.init', () => {
        expect(MockOTSession.init).toHaveBeenCalledWith(
          'mockAPIKey', 'mockSessionId',
          'mockToken'
        );
      });
    });
  });
});
