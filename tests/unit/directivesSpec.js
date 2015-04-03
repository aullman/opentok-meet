describe('draggable', function () {
  var scope, element, $document;
  beforeEach(module('opentok-meet'));
  beforeEach(inject(function ($rootScope, $compile, _$document_) {
    scope = $rootScope.$new();
    $document = _$document_;
    element = '<div draggable="true"></div>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('moves elements with mousedown and mousemove', function () {
    expect(element.css('top')).toBe('');
    expect(element.css('left')).toBe('');
    element.triggerHandler({
      type: 'mousedown',
      pageX: 0,
      pageY: 0
    });
    $document.triggerHandler({
      type: 'mousemove',
      pageX: 10,
      pageY: 10
    });
    expect(element.css('top')).toBe('10px');
    expect(element.css('left')).toBe('10px');
  });

  it('stops moving elements with mouseup', function () {
    element.triggerHandler({
      type: 'mousedown',
      pageX: 0,
      pageY: 0
    });
    $document.triggerHandler({
      type: 'mousemove',
      pageX: 10,
      pageY: 10
    });
    $document.triggerHandler({
      type: 'mouseup'
    });
    $document.triggerHandler({
      type: 'mousemove',
      pageX: 100,
      pageY: 100
    });
    expect(element.css('top')).toBe('10px');
    expect(element.css('left')).toBe('10px');
  });

  it('stops moving elements with mouseleave', function () {
    element.triggerHandler({
      type: 'mousedown',
      pageX: 0,
      pageY: 0
    });
    $document.triggerHandler({
      type: 'mousemove',
      pageX: 10,
      pageY: 10
    });
    $($document[0].body).triggerHandler({
      type: 'mouseleave'
    });
    $document.triggerHandler({
      type: 'mousemove',
      pageX: 100,
      pageY: 100
    });
    expect(element.css('top')).toBe('10px');
    expect(element.css('left')).toBe('10px');
  });
});

describe('syncClick', function () {
  var scope, element;
  beforeEach(module('opentok-meet'));
  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.syncClick = jasmine.createSpy('syncClick');
    element = '<div sync-click="syncClick()"></div>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('calls syncClick on click event', function () {
    element.triggerHandler('click');
    expect(scope.syncClick).toHaveBeenCalled();
  });
});

describe('muteVideo', function () {
  var scope, element;
  beforeEach(module('opentok-meet'));
  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.muted = false;
    element = '<mute-video muted="muted"></mute-video>';
    element = $compile(element)(scope);
    scope.$digest();
  }));
  
  it('creates two i elements with the right classes', function () {
    expect(element.find('i').length).toBe(2);
    var firstI = element.find('i')[0];
    expect(firstI.className).toContain('video-icon');
    expect(firstI.className).toContain('ion-ios7-videocam');
    var secondI = element.find('i')[1];
    expect(secondI.className).toContain('cross-icon');
    expect(secondI.className).toContain('ion-ios7-close');
  });

  it('changes classes when muted changes', function () {
    var secondI = element.find('i')[1];
    expect(scope.muted).toBe(false);
    expect(secondI.className).toContain('ion-ios7-close');
    scope.muted = true;
    scope.$digest();
    expect(secondI.className).toContain('ion-ios7-checkmark');
  });
});

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