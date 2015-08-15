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

describe('muteSubscriber', function () {
  var scope, element, mockSubscriber, OTSession;
  beforeEach(module('opentok-meet'));
  beforeEach(inject(function ($rootScope, $compile, _OTSession_) {
    scope = $rootScope.$new();
    OTSession = _OTSession_;
    mockSubscriber = jasmine.createSpyObj('Subscriber', ['subscribeToVideo']);
    OTSession.session = {};
    OTSession.session.getSubscribersForStream = function () {
      return [mockSubscriber];
    };

    element = '<div mute-subscriber></div>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('toggles subscribeToVideo on click', function () {
    expect(scope.muted).toBe(false);
    element.triggerHandler({type: 'click'});
    expect(scope.muted).toBe(true);
    expect(mockSubscriber.subscribeToVideo).toHaveBeenCalledWith(false);
    element.triggerHandler({type: 'click'});
    expect(scope.muted).toBe(false);
    expect(mockSubscriber.subscribeToVideo).toHaveBeenCalledWith(true);
  });
});

describe('mutePublisher', function () {
  var scope, element, mockPublisher, OTSession;
  beforeEach(module('opentok-meet'));
  beforeEach(inject(function ($rootScope, $compile, _OTSession_) {
    scope = $rootScope.$new();
    OTSession = _OTSession_;
    mockPublisher = jasmine.createSpyObj('Publisher', ['publishVideo']);
    mockPublisher.id = 'mockPublisher';
    OTSession.publishers = [mockPublisher];

    element = '<div publisher-id="mockPublisher" mute-publisher></div>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('toggles publisherVideoMuted and calls publishVideo on the facePublisher', function () {
    expect(scope.muted).toBe(false);
    element.triggerHandler({type: 'click'});
    expect(scope.muted).toBe(true);
    expect(mockPublisher.publishVideo).toHaveBeenCalledWith(false);
    element.triggerHandler({type: 'click'});
    expect(scope.muted).toBe(false);
    expect(mockPublisher.publishVideo).toHaveBeenCalledWith(true);
  });
});

describe('restrictFrameRate', function () {
  var scope, element, mockSubscriber, OTSession;
  beforeEach(module('opentok-meet'));
  beforeEach(inject(function ($rootScope, $compile, _OTSession_) {
    scope = $rootScope.$new();
    OTSession = _OTSession_;
    mockSubscriber = jasmine.createSpyObj('Subscriber', ['restrictFrameRate']);
    OTSession.session = {};
    OTSession.session.getSubscribersForStream = function () {
      return [mockSubscriber];
    };

    element = '<restrict-framerate></restrict-framerate>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('toggles stream.restrictedFrameRate and calls restrictFrameRate', function () {
    expect(scope.restrictedFrameRate).toBe(false);
    element.triggerHandler({type: 'click'});
    expect(mockSubscriber.restrictFrameRate).toHaveBeenCalledWith(true);
    expect(scope.restrictedFrameRate).toBe(true);
    element.triggerHandler({type: 'click'});
    expect(mockSubscriber.restrictFrameRate).toHaveBeenCalledWith(false);
    expect(scope.restrictedFrameRate).toBe(false);
  });
});

// This is the double click to enlarge functionality
describe('changeSize', function () {
  var scope, parent, expandButton;
  beforeEach(module('opentok-meet'));
  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.stream = {name: 'face'};
    expandButton = angular.element('<expand-button></expand-button>');
    parent = angular.element('<div></div>');
    parent.append(expandButton);
    expandButton = $compile(expandButton)(scope);
    scope.$digest();
  }));
  it('defaults screens to large', function () {
    expect(scope.expanded).toBeFalsy();
    scope.stream.name = 'screen';
    expandButton.triggerHandler({type: 'click'});
    expect(scope.expanded).toBe(false);
  });
  it('defaults other screens to small', function () {
    expandButton.triggerHandler({type: 'click'});
    expect(scope.expanded).toBe(true);
  });
  it('emits otLayout', function (done) {
    scope.$on('otLayout', function () {
      done();
    });
    expandButton.triggerHandler({type: 'click'});
  });
  it('works when you double click the parent', function () {
    parent.triggerHandler({type: 'dblclick'});
    expect(scope.expanded).toBe(true);
    parent.triggerHandler({type: 'dblclick'});
    expect(scope.expanded).toBe(false);
  });
});
