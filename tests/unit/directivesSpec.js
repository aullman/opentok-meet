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

  describe('two i elements', function () {
    var firstI, secondI;
    beforeEach(function () {
      firstI = element.find('i')[0];
      secondI = element.find('i')[1];
    });
    it('creates two i elements with the right classes', function () {
      expect(element.find('i').length).toBe(2);
      expect(firstI.className).toContain('video-icon');
      expect(firstI.className).toContain('ion-ios7-videocam');
      expect(secondI.className).toContain('cross-icon');
      expect(secondI.className).toContain('ion-ios7-close');
    });
    it('changes title when muted changes', function () {
      expect(firstI.getAttribute('title')).toBe('Mute Video');
      scope.muted = true;
      scope.$digest();
      expect(firstI.getAttribute('title')).toBe('Unmute Video');
    });
    it('changes classes when muted changes', function () {
      expect(scope.muted).toBe(false);
      expect(secondI.className).toContain('ion-ios7-close');
      scope.muted = true;
      scope.$digest();
      expect(secondI.className).toContain('ion-ios7-checkmark');
    });
  });
});