/* jasmine specs for controllers go here */
describe('OpenTok Meet controllers', function() {

  describe('RoomCtrl', function(){

    var ctrl,
      scope,
      RoomServiceMock,
      windowMock,
      $httpBackend,
      roomDefer;

    beforeEach(module('opentok-meet'));
    
    beforeEach(inject(function($controller, $rootScope, $q, $injector) {
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
          roomDefer = $q.defer();
          return roomDefer.promise;
        }
      };
      windowMock = jasmine.createSpyObj('$window', ['addEventListener']);
      documentMock = {context: { body: jasmine.createSpyObj('body', ['addEventListener'])}};
      $httpBackend = $injector.get('$httpBackend');
      ctrl = $controller('RoomCtrl', {$scope:scope, $window: windowMock, 
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

    describe('togglePublish', function () {
      it('publishes with HD properties', function () {
        scope.togglePublish(true);
        expect(scope.publishing).toBe(true);
        expect(scope.facePublisherProps.resolution).toBe('1280x720');
        scope.togglePublish(true);
        expect(scope.publishing).toBe(false);
      });
      it('publishes with SD properties', function () {
        scope.togglePublish(false);
        expect(scope.publishing).toBe(true);
        expect(scope.facePublisherProps.resolution).not.toBeDefined();
      });
    });

    describe('toggleArchiving', function () {
      it('toggles the archiving property', function () {
        expect(scope.archiving).toBe(false);
        scope.toggleArchiving();
        expect(scope.archiving).toBe(true);
        scope.toggleArchiving();
        expect(scope.archiving).toBe(false);
      });
      it('posts to /startArchive and /stopArchive', function () {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(200, '{"archiveId": "mockArchiveId"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiveId).toBe('mockArchiveId');
        expect(scope.archiving).toBe(true);

        $httpBackend.expectPOST('undefined/stopArchive', {archiveId: 'mockArchiveId'})
          .respond(200, '{"archiveId": "mockArchiveId"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(false);
      });
      it('handles errors from /startArchive', function () {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(200, '{"error": "mock error"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(false);
      });
      it('handles errors from /stopArchive', function () {
        $httpBackend.expectPOST('undefined/startArchive')
          .respond(200, '{"archiveId": "mockArchiveId"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        $httpBackend.expectPOST('undefined/stopArchive', {archiveId: 'mockArchiveId'})
          .respond(200, '{"error": "mock error message"}');
        scope.toggleArchiving();
        $httpBackend.flush();
        expect(scope.archiving).toBe(true);
      });
    });
  });
});
