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
      spyOn(OT, 'registerScreenSharingExtension').and.callThrough();
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
        $document: documentMock, $timeout: {}, OTSession: {}, RoomService: RoomServiceMock, baseURL: '', chromeExtensionId: 'mockExtensionId'});
    }));

    it('should define screenPublisherProps', function () {
      expect(scope.screenPublisherProps).toEqual({
          name: "screen",
          style:{nameDisplayMode:"off"},
          publishAudio: false,
          videoSource: 'screen'
      });
    });
    
    it('should define facePublisherProps', function () {
      expect(scope.facePublisherProps).toEqual({
          name:'face',
          width: '100%',
          height: '100%',
          style: {
              nameDisplayMode: 'off'
          },
          resolution: '1280x720',
          frameRate: 30
      });
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

    describe('toggleShareScreen', function () {
      it('Calls OT.registerScreenSharingExtension', function () {
        expect(OT.registerScreenSharingExtension).toHaveBeenCalledWith('chrome', 'mockExtensionId');
      });
      it('Calls OT.checkScreenSharingCapability', function () {
        spyOn(OT, 'checkScreenSharingCapability').and.callThrough();
        scope.toggleShareScreen();
        expect(OT.checkScreenSharingCapability).toHaveBeenCalledWith(jasmine.any(Function));
      });
      it('Sets screenShareSupported to false if screensharing is not supported', function () {
        scope.screenShareSupported = true;
        spyOn(OT, 'checkScreenSharingCapability').and.callFake(function (callback) {
          callback({supported: false});
        });
        scope.toggleShareScreen();
        expect(scope.screenShareSupported).toBe(false);
      });
      it('Prompts to install if the extension is not installed', function () {
        expect(scope.promptToInstall).toBe(false);
        spyOn(OT, 'checkScreenSharingCapability').and.callFake(function (callback) {
          callback({supported: true, extensionInstalled: false});
        });
        scope.toggleShareScreen();
        expect(scope.promptToInstall).toBe(true);
        expect(scope.selectingScreenSource).toBe(false);
      });
      it('Shares your screen if supported and the extension is installed', function () {
        expect(scope.sharingMyScreen).toBe(false);
        spyOn(OT, 'checkScreenSharingCapability').and.callFake(function (callback) {
          callback({supported: true, extensionInstalled: true});
        });
        scope.toggleShareScreen();
        expect(scope.sharingMyScreen).toBe(true);
        expect(scope.selectingScreenSource).toBe(false);
      });
      it('Stops sharing if you previously were', function () {
        scope.sharingMyScreen = true;
        scope.toggleShareScreen();
        expect(scope.sharingMyScreen).toBe(false);
      });
      it('Stops sharing if the stream is destroyed', function () {
        scope.sharingMyScreen = true;
        scope.publisher = {id: 'screenPublisher'};
        scope.$emit('otStreamDestroyed');
        expect(scope.sharingMyScreen).toBe(false);
      });
      it('Shows a failed message if you get a otPublisherError error', function () {
        scope.sharingMyScreen = true;
        scope.$emit('otPublisherError', {message: 'mockErrorMessage'}, {id: 'screenPublisher'});
        expect(scope.sharingMyScreen).toBe(false);
        expect(scope.screenShareFailed).toBe('mockErrorMessage');
      });
    });
  });
});
