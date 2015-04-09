describe('screenShareDialogs', function() {
  var scope, element;
  beforeEach(module('opentok-meet', function($provide) {
    $provide.value('chromeExtensionId', 'mockExtensionId');
  }));
  beforeEach(inject(function ($rootScope, $compile) {
    spyOn(OT, 'registerScreenSharingExtension').and.callThrough();
    scope = $rootScope.$new();
    element = '<screen-share-dialogs></screen-share-dialogs>';
    element = $compile(element)(scope);
    scope.$digest();
  }));
  it('should define screenPublisherProps', function() {
    expect(scope.screenPublisherProps).toEqual({
      name: 'screen',
      style: {
        nameDisplayMode: 'off'
      },
      publishAudio: false,
      videoSource: 'screen'
    });
  });
  it('Calls OT.registerScreenSharingExtension', function() {
    expect(OT.registerScreenSharingExtension).toHaveBeenCalledWith('chrome', 'mockExtensionId');
  });
  it('Calls OT.checkScreenSharingCapability', function() {
    spyOn(OT, 'checkScreenSharingCapability').and.callThrough();
    scope.toggleShareScreen();
    expect(OT.checkScreenSharingCapability).toHaveBeenCalledWith(jasmine.any(Function));
  });
  it('Sets screenShareSupported to false if screensharing is not supported', function() {
    scope.screenShareSupported = true;
    spyOn(OT, 'checkScreenSharingCapability').and.callFake(function(callback) {
      callback({
        supported: false
      });
    });
    scope.toggleShareScreen();
    expect(scope.screenShareSupported).toBe(false);
  });
  it('Prompts to install if the extension is not installed', function() {
    expect(scope.promptToInstall).toBe(false);
    spyOn(OT, 'checkScreenSharingCapability').and.callFake(function(callback) {
      callback({
        supported: true,
        extensionInstalled: false
      });
    });
    scope.toggleShareScreen();
    expect(scope.promptToInstall).toBe(true);
    expect(scope.selectingScreenSource).toBe(false);
  });
  it('Shares your screen if supported and the extension is installed', function() {
    expect(scope.sharingMyScreen).toBe(false);
    spyOn(OT, 'checkScreenSharingCapability').and.callFake(function(callback) {
      callback({
        supported: true,
        extensionInstalled: true
      });
    });
    scope.toggleShareScreen();
    expect(scope.sharingMyScreen).toBe(true);
    expect(scope.selectingScreenSource).toBe(false);
  });
  it('Stops sharing if you previously were', function() {
    scope.sharingMyScreen = true;
    scope.toggleShareScreen();
    expect(scope.sharingMyScreen).toBe(false);
  });
  it('Stops sharing if the stream is destroyed', function() {
    scope.sharingMyScreen = true;
    scope.publisher = {
      id: 'screenPublisher'
    };
    scope.$emit('otStreamDestroyed');
    expect(scope.sharingMyScreen).toBe(false);
  });
  it('Shows a failed message if you get a otPublisherError error', function() {
    scope.sharingMyScreen = true;
    scope.$emit('otPublisherError', {
      message: 'mockErrorMessage'
    }, {
      id: 'screenPublisher'
    });
    expect(scope.sharingMyScreen).toBe(false);
    expect(scope.screenShareFailed).toBe('mockErrorMessage');
  });
});