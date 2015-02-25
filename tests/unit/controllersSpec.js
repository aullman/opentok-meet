/* jasmine specs for controllers go here */
describe('OpenTok Meet controllers', function() {

  describe('RoomCtrl', function(){

    var ctrl,
      scope,
      RoomServiceMock,
      windowMock;

    beforeEach(module('opentok-meet'));
    
    beforeEach(inject(function($controller, $rootScope, $q) {
      scope = $rootScope.$new();
      scope.session = {
        connection: {
          connectionId: 'mockConnectionId'
        }
      };
      RoomServiceMock = {
        changeRoom: function () {
        },
        getRoom: function () {
          var deferred = $q.defer();
          return deferred.promise;
        }
      };
      windowMock = jasmine.createSpyObj('$window', ['addEventListener']);
      documentMock = {context: { body: jasmine.createSpyObj('body', ['addEventListener'])}};
      ctrl = $controller('RoomCtrl', {$scope:scope, $http: {}, $window: windowMock, 
        $document: documentMock, $timeout: {}, OTSession: {}, RoomService: RoomServiceMock, baseURL: ''});
    }));

    it('should define screenPublisherProps', function () {
      expect(scope.screenPublisherProps).toBeDefined();
    });
    
    it('should define facePublisherProps', function () {
      expect(scope.facePublisherProps).toBeDefined();
    });

    it('should have a notMine method that works', function () {
      expect(scope.notMine).toBeDefined();
      expect(scope.notMine({connection: {connectionId: 'someOtherConnectionId'}})).toEqual(true);
      expect(scope.notMine({connection: {connectionId: 'mockConnectionId'}})).toEqual(false);
    });
  });
});
