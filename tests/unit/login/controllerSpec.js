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

      it('sets the url correctly for normal roomType, tokenRole defaults to moderator', () => {
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo?tokenRole=moderator');
      });

      it('sets the url correctly for whiteboard roomType, tokenRole defaults to moderator', () => {
        scope.roomType = 'whiteboard';
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo/whiteboard?tokenRole=moderator');
      });

      it('sets the url correctly for screen roomType, tokenRole defaults to moderator', () => {
        scope.roomType = 'screen';
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo/screen?tokenRole=moderator');
      });

      it('sets the url correctly for normal roomType, tokenRole=publisher', () => {
        scope.tokenRole = 'publisher';
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo?tokenRole=publisher');
      });

      it('sets the url correctly for whiteboard roomType, tokenRole=publisher', () => {
        scope.roomType = 'whiteboard';
        scope.tokenRole = 'publisher';
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo/whiteboard?tokenRole=publisher');
      });

      it('sets the url correctly for screen roomType, tokenRole=publisher', () => {
        scope.roomType = 'screen';
        scope.tokenRole = 'publisher';
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo/screen?tokenRole=publisher');
      });

      it('sets the url correctly for normal roomType, tokenRole=subscriber', () => {
        scope.tokenRole = 'subscriber';
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo?tokenRole=subscriber');
      });

      it('sets the url correctly for whiteboard roomType, tokenRole=subscriber', () => {
        scope.roomType = 'whiteboard';
        scope.tokenRole = 'subscriber';
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo/whiteboard?tokenRole=subscriber');
      });

      it('sets the url correctly for screen roomType, tokenRole=subscriber', () => {
        scope.roomType = 'screen';
        scope.tokenRole = 'subscriber';
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo/screen?tokenRole=subscriber');
      });

      it('defaults the url to moderator for screen roomType, when the tokenRole is invalid', () => {
        scope.roomType = 'screen';
        scope.tokenRole = 'boo';
        scope.joinRoom();
        expect(windowMock.location.href).toEqual('mockURL/foo/screen?tokenRole=moderator');
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
