const angular = require('angular');
const $ = require('jquery');
require('angular-mocks');
require('../../src/js/app.js');

describe('draggable', () => {
  let scope;
  let element;
  let $document;
  let $window;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(($rootScope, $compile, _$document_, _$window_) => {
    scope = $rootScope.$new();
    $document = _$document_;
    $window = _$window_;
    element = '<div draggable="true"></div>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('moves elements with mousedown and mousemove', () => {
    expect(element.css('top') === '' || element.css('top') === 'auto').toBe(true);
    expect(element.css('left') === '' || element.css('left') === 'auto').toBe(true);
    element.triggerHandler({
      type: 'mousedown',
      pageX: 0,
      pageY: 0,
    });
    $document.triggerHandler({
      type: 'mousemove',
      pageX: 10,
      pageY: 10,
    });
    expect(element.css('top')).toBe('10px');
    expect(element.css('left')).toBe('10px');
  });

  it('stops moving elements with mouseup', () => {
    element.triggerHandler({
      type: 'mousedown',
      pageX: 0,
      pageY: 0,
    });
    $document.triggerHandler({
      type: 'mousemove',
      pageX: 10,
      pageY: 10,
    });
    $document.triggerHandler({
      type: 'mouseup',
    });
    $document.triggerHandler({
      type: 'mousemove',
      pageX: 100,
      pageY: 100,
    });
    expect(element.css('top')).toBe('10px');
    expect(element.css('left')).toBe('10px');
  });

  it('stops moving elements with mouseleave', () => {
    element.triggerHandler({
      type: 'mousedown',
      pageX: 0,
      pageY: 0,
    });
    $document.triggerHandler({
      type: 'mousemove',
      pageX: 10,
      pageY: 10,
    });
    $($document[0].body).triggerHandler({
      type: 'mouseleave',
    });
    $document.triggerHandler({
      type: 'mousemove',
      pageX: 100,
      pageY: 100,
    });
    expect(element.css('top')).toBe('10px');
    expect(element.css('left')).toBe('10px');
  });

  it('realigns to the bottom right if you resize too small', () => {
    element.triggerHandler({
      type: 'mousedown',
      pageX: 0,
      pageY: 0,
    });
    $document.triggerHandler({
      type: 'mousemove',
      pageX: 10000,
      pageY: 10000,
    });
    $document.triggerHandler({
      type: 'mouseup',
    });
    const event = document.createEvent('Event');
    event.initEvent('resize', false, true);
    $window.dispatchEvent(event);
    expect(element.css('bottom')).toBe('10px');
    expect(element.css('right')).toBe('10px');
    // In IE 10 for some reason it gets set to 0px even though we set it to auto
    expect(element.css('top') === '0px' || element.css('top') === 'auto').toBe(true);
    expect(element.css('left') === '0px' || element.css('left') === 'auto').toBe(true);
  });
});

describe('muteVideo', () => {
  let scope;
  let element;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(($rootScope, $compile) => {
    scope = $rootScope.$new();
    scope.mutedVideo = false;
    element = '<mute-video muted="muted"></mute-video>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  describe('two i elements', () => {
    let firstI;
    let secondI;
    beforeEach(() => {
      const iElements = element.find('i');
      // Don't use destructuring here because then we require babel-polyfill for IE11
      firstI = iElements[0];  // eslint-disable-line
      secondI = iElements[1]; // eslint-disable-line
    });
    it('creates two i elements with the right classes', () => {
      expect(element.find('i').length).toBe(2);
      expect(firstI.className).toContain('video-icon');
      expect(firstI.className).toContain('ion-ios7-videocam');
      expect(secondI.className).toContain('cross-icon');
      expect(secondI.className).toContain('ion-ios7-close');
    });
    it('changes title when muted changes', () => {
      expect(firstI.getAttribute('title')).toBe('Mute Video');
      scope.mutedVideo = true;
      scope.$digest();
      expect(firstI.getAttribute('title')).toBe('Unmute Video');
    });
    it('changes classes when muted changes', () => {
      expect(scope.mutedVideo).toBe(false);
      expect(secondI.className).toContain('ion-ios7-close');
      scope.mutedVideo = true;
      scope.$digest();
      expect(secondI.className).toContain('ion-ios7-checkmark');
    });
  });
});

describe('muteSubscriber', () => {
  let scope;
  let element;
  let mockSubscriber;
  let OTSession;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(($rootScope, $compile, _OTSession_) => {
    scope = $rootScope.$new();
    OTSession = _OTSession_;
    mockSubscriber = jasmine.createSpyObj('Subscriber', ['subscribeToVideo']);
    OTSession.session = {};
    OTSession.session.getSubscribersForStream = () => [mockSubscriber];

    element = '<div mute-subscriber></div>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('toggles subscribeToVideo on click', () => {
    expect(scope.mutedVideo).toBe(false);
    element.triggerHandler({ type: 'click' });
    expect(scope.mutedVideo).toBe(true);
    expect(mockSubscriber.subscribeToVideo).toHaveBeenCalledWith(false);
    element.triggerHandler({ type: 'click' });
    expect(scope.mutedVideo).toBe(false);
    expect(mockSubscriber.subscribeToVideo).toHaveBeenCalledWith(true);
  });
});

describe('mutePublisher', () => {
  let scope;
  let element;
  let mockPublisher;
  let OTSession;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(($rootScope, _OTSession_) => {
    scope = $rootScope.$new();
    OTSession = _OTSession_;
    mockPublisher = jasmine.createSpyObj('Publisher', ['publishVideo', 'publishAudio']);
    mockPublisher.id = 'mockPublisher';
    OTSession.publishers = [mockPublisher];
  }));

  describe('Video type', () => {
    beforeEach(() => {
      inject(($compile) => {
        element = '<div publisher-id="mockPublisher" mute-publisher></div>';
        element = $compile(element)(scope);
        scope.$digest();
      });
    });

    it('toggles publisherVideoMuted and calls publishVideo on the facePublisher', () => {
      expect(scope.mutedVideo).toBe(false);
      element.triggerHandler({ type: 'click' });
      expect(scope.mutedVideo).toBe(true);
      expect(mockPublisher.publishVideo).toHaveBeenCalledWith(false);
      element.triggerHandler({ type: 'click' });
      expect(scope.mutedVideo).toBe(false);
      expect(mockPublisher.publishVideo).toHaveBeenCalledWith(true);
    });
  });

  describe('Audio type', () => {
    beforeEach(() => {
      inject(($compile) => {
        element = '<div publisher-id="mockPublisher" muted-type="Audio" mute-publisher></div>';
        element = $compile(element)(scope);
        scope.$digest();
      });
    });

    it('toggles mutedAudio and calls publishAudio on the facePublisher', () => {
      expect(scope.mutedAudio).toBe(false);
      element.triggerHandler({ type: 'click' });
      expect(scope.mutedAudio).toBe(true);
      expect(mockPublisher.publishAudio).toHaveBeenCalledWith(false);
      element.triggerHandler({ type: 'click' });
      expect(scope.mutedAudio).toBe(false);
      expect(mockPublisher.publishAudio).toHaveBeenCalledWith(true);
    });
  });
});

describe('restrictFrameRate', () => {
  let scope;
  let element;
  let mockSubscriber;
  let OTSession;
  let button;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(($rootScope, $compile, _OTSession_) => {
    scope = $rootScope.$new();
    OTSession = _OTSession_;
    mockSubscriber = jasmine.createSpyObj('Subscriber', ['restrictFrameRate']);
    OTSession.session = {};
    OTSession.session.getSubscribersForStream = () => [mockSubscriber];

    element = '<restrict-framerate></restrict-framerate>';
    element = $compile(element)(scope);
    button = element.find('button');
    scope.$digest();
  }));

  it('toggles stream.restrictedFrameRate and calls restrictFrameRate', () => {
    expect(scope.restrictedFrameRate).toBe(false);
    button.triggerHandler({ type: 'click' });
    expect(mockSubscriber.restrictFrameRate).toHaveBeenCalledWith(true);
    expect(scope.restrictedFrameRate).toBe(true);
    button.triggerHandler({ type: 'click' });
    expect(mockSubscriber.restrictFrameRate).toHaveBeenCalledWith(false);
    expect(scope.restrictedFrameRate).toBe(false);
  });
});

describe('reconnectingOverlay', () => {
  let scope;
  let element;
  let $interval;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(($rootScope, $compile, _$interval_) => {
    scope = $rootScope.$new();
    $interval = _$interval_;

    element = '<reconnecting-overlay></reconnecting-overlay>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('adds dots as time passes and resets after 3 dots', () => {
    expect(scope.dots).toBe('');
    $interval.flush(1000);
    expect(scope.dots).toBe('.');
    $interval.flush(1000);
    expect(scope.dots).toBe('..');
    $interval.flush(1000);
    expect(scope.dots).toBe('...');
    $interval.flush(1000);
    expect(scope.dots).toBe('');
  });
});

// This is the double click to enlarge functionality
describe('changeSize', () => {
  let scope;
  let parent;
  let expandButton;
  let $rootScope;
  let $compile;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject((_$rootScope_, _$compile_) => {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    scope = $rootScope.$new();
    scope.stream = { name: 'face' };
    expandButton = angular.element('<expand-button></expand-button>');
    parent = angular.element('<div></div>');
    parent.append(expandButton);
  }));
  it('defaults screens to large', () => {
    scope.stream.name = 'screen';
    expandButton = $compile(expandButton)(scope).find('button');
    scope.$digest();
    expect(scope.expanded).toBe(true);
    expandButton.triggerHandler({ type: 'click' });
    expect(scope.expanded).toBe(false);
  });
  it('defaults other screens to small', () => {
    expandButton = $compile(expandButton)(scope).find('button');
    scope.$digest();
    expandButton.triggerHandler({ type: 'click' });
    expect(scope.expanded).toBe(true);
  });
  it('emits otLayout', (done) => {
    expandButton = $compile(expandButton)(scope).find('button');
    scope.$digest();
    $rootScope.$on('otLayout', done);
    expandButton.triggerHandler({ type: 'click' });
  });
  it('works when you double click the parent', () => {
    expandButton = $compile(expandButton)(scope);
    scope.$digest();
    parent.triggerHandler({ type: 'dblclick' });
    expect(scope.expanded).toBe(true);
    parent.triggerHandler({ type: 'dblclick' });
    expect(scope.expanded).toBe(false);
  });
});

describe('cycleCamera', () => {
  let scope;
  let mockPublisher;
  let OTSession;
  let element;
  let button;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(($rootScope, _OTSession_) => {
    scope = $rootScope.$new();
    OTSession = _OTSession_;
    mockPublisher = jasmine.createSpyObj('Publisher', ['cycleVideo']);
    mockPublisher.id = 'mockPublisher';
    OTSession.publishers = [mockPublisher];
  }));

  const createCycleCameraWithMockDevices = (devices) => {
    inject(($compile) => {
      spyOn(OT, 'getDevices').and.callFake((callback) => {
        callback(null, devices);
      });
      element = '<cycle-camera publisher-id="mockPublisher"></cycle-camera>';
      element = $compile(element)(scope);
      button = element.find('button');
      scope.$digest();
    });
  };

  describe('with multiple cameras', () => {
    beforeEach(() => {
      createCycleCameraWithMockDevices([{
        kind: 'videoInput',
      },
      {
        kind: 'videoInput',
      },
      ]);
    });

    it('Calls cycleVideo on the publisher', () => {
      expect(mockPublisher.cycleVideo).not.toHaveBeenCalled();
      button.triggerHandler({
        type: 'click',
      });
      expect(mockPublisher.cycleVideo).toHaveBeenCalled();
    });

    it('The button is shown', () => {
      expect(button.hasClass('ng-hide')).toBe(false);
    });
  });

  describe('with one camera', () => {
    beforeEach(() => {
      createCycleCameraWithMockDevices([{
        kind: 'videoInput',
      },
      ]);
    });

    it('The button is not shown', () => {
      expect(button.hasClass('ng-hide')).toBe(true);
    });
  });
});
