/* jasmine specs for controllers go here */
describe('OpenTok Login Page', () => {
  describe('MainCtrl', () => {
    let scope;
    let windowMock;
    beforeEach(angular.mock.module('opentok-meet-login'));

    beforeEach(inject(($controller, $rootScope) => {
      scope = $rootScope.$new();
      windowMock = jasmine.createSpy('$window');
      $controller('MainCtrl', {
        $scope: scope,
        $window: windowMock,
      });
    }));

    it('initializes correctly', () => {
      expect(scope.p2p).toBe(false);
      expect(scope.room).toBe('');
      expect(scope.roomType).toBe('normal');
    });

    describe('joinRoom', () => {
      beforeEach(() => {
        scope.room = 'foo';
        windowMock.location = {
          href: 'mockURL/',
        };
      });

      it('sets the url correctly for normal roomType', () => {
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo');
      });

      it('sets the url correctly for whiteboard roomType', () => {
        scope.roomType = 'whiteboard';
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo/whiteboard');
      });

      it('sets the url correctly for screen roomType', () => {
        scope.roomType = 'screen';
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo/screen');
      });
    });

    it('watches the room and updates p2p', () => {
      scope.room = 'test';
      scope.$apply();
      expect(scope.p2p).toBe(false);
      scope.room = 'testp2p';
      scope.$apply();
      expect(scope.p2p).toBe(true);
    });

    it('updates the room when p2p changes', () => {
      scope.room = 'test';
      scope.p2p = true;
      scope.p2pChanged();
      expect(scope.room).toBe('testp2p');
      scope.p2p = false;
      scope.p2pChanged();
      expect(scope.room).toBe('test');
    });
  });
});
