/* jasmine specs for controllers go here */
describe('OpenTok Login Page', function() {

  describe('MainCtrl', function() {
    var scope, ctrl, windowMock;
    beforeEach(angular.mock.module('opentok-meet-login'));

    beforeEach(inject(function($controller, $rootScope) {
      scope = $rootScope.$new();
      windowMock = jasmine.createSpy('$window');
      ctrl = $controller('MainCtrl', {
        $scope: scope,
        $window: windowMock
      });
    }));

    it('initializes correctly', function () {
      expect(scope.p2p).toBe(false);
      expect(scope.room).toBe('');
    });

    it('watches the room and updates p2p', function () {
      scope.room = 'test';
      scope.$apply();
      expect(scope.p2p).toBe(false);
      scope.room = 'testp2p';
      scope.$apply();
      expect(scope.p2p).toBe(true);
    });

    it('updates the room when p2p changes', function () {
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
