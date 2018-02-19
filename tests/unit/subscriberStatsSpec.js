const angular = require('angular');
// require('angular-mocks');
require('../../src/js/app.js');

describe('subscriber-stats', () => {
  let scope,
    element,
    mockStream = {},
    OTSession,
    mockSubscriber,
    mockStats,
    $timeout,
    StatsService;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(angular.mock.module(($provide) => {
    $provide.value('statsInterval', 10);
  }));
  beforeEach(inject(($rootScope, $compile, _OTSession_, _StatsService_, _$timeout_) => {
    OTSession = _OTSession_;
    OTSession.session = {
      getSubscribersForStream() {},
    };
    $timeout = _$timeout_;
    StatsService = _StatsService_;
    spyOn(StatsService, 'addSubscriber');
    mockSubscriber = jasmine.createSpyObj('Subscriber', ['getStats', 'setStyle', 'on']);
    mockSubscriber.id = 'mockId';
    spyOn(OTSession.session, 'getSubscribersForStream').and.callFake(() => [mockSubscriber]);
    scope = $rootScope.$new();
    element = '<subscriber-stats stream="stream"></subscriber-stats>';
    scope.stream = mockStream;
    element = $compile(element)(scope);
    scope.$digest();
    mockStats = {};
    $timeout.flush();
  }));

  it('calls OTSession.session.getSubscribersForStream', () => {
    expect(OTSession.session.getSubscribersForStream).toHaveBeenCalledWith(mockStream);
  });

  it('does not add a subscriber to StatsService if we are not conected', () => {
    expect(StatsService.addSubscriber).not.toHaveBeenCalledWith(mockSubscriber, jasmine.any(Function));
  });

  describe('with a connected subscriber', () => {
    beforeEach(() => {
      mockSubscriber.on.calls.mostRecent().args[1]();
    });

    it('adds a subscriber to StatsService', () => {
      expect(StatsService.addSubscriber).toHaveBeenCalledWith(mockSubscriber, jasmine.any(Function));
    });

    it('sets stats on the scope', () => {
      StatsService.addSubscriber.calls.mostRecent().args[1](mockStats);
      expect(scope.$$childHead.stats).toBe(mockStats);
    });

    it('handles $destroy', () => {
      spyOn(StatsService, 'removeSubscriber');
      spyOn($timeout, 'cancel');
      scope.$destroy();
      expect(StatsService.removeSubscriber).toHaveBeenCalledWith(mockSubscriber.id);
      expect($timeout.cancel).toHaveBeenCalled();
    });

    it('toggles showStats and buttonDisplayMode on click', () => {
      expect(scope.$$childHead.showStats).toBeFalsy();
      const statsBtn = element.find('button');
      statsBtn.triggerHandler({ type: 'click' });
      expect(scope.$$childHead.showStats).toBe(true);
      expect(mockSubscriber.setStyle).toHaveBeenCalledWith({ buttonDisplayMode: 'on' });
      statsBtn.triggerHandler({ type: 'click' });
      expect(scope.$$childHead.showStats).toBe(false);
      expect(mockSubscriber.setStyle).toHaveBeenCalledWith({ buttonDisplayMode: 'auto' });
    });

    it('displays the stats correctly', () => {
      scope.$$childHead.stats = {
        width: 200,
        height: 200,
        audio: mockStats.audio,
        video: mockStats.video,
        audioPacketLoss: '20.00',
        videoPacketLoss: '20.00',
        audioBitrate: '0',
        videoBitrate: '0',
        timestamp: mockStats.timestamp,
      };
      scope.$digest();

      expect(element.find('[data-for="resolution"]').html()).toEqual('200x200');
      expect(element.find('[data-for="audioPacketLoss"]').html()).toEqual('20.00%');
      expect(element.find('[data-for="audioBitrate"]').html()).toEqual('0.00 kbps');
      expect(element.find('[data-for="videoPacketLoss"]').html()).toEqual('20.00%');
      expect(element.find('[data-for="videoBitrate"]').html()).toEqual('0.00 kbps');
      expect(element.find('[data-for="videoFramerate"]').html()).toEqual('0.00 fps');
    });
  });
});

describe('StatsService', () => {
  let StatsService,
    $interval,
    onStats,
    mockSubscriber,
    mockStats;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject((_StatsService_, _$interval_) => {
    StatsService = _StatsService_;
    $interval = _$interval_;
    onStats = jasmine.createSpy('onStats');
    mockSubscriber = jasmine.createSpyObj('Subscriber', ['getStats', 'setStyle']);
    mockSubscriber.id = 'mockId';
    mockSubscriber.videoWidth = mockSubscriber.videoHeight = function () {
      return 200;
    };
    StatsService.addSubscriber(mockSubscriber, onStats);
    mockStats = {
      audio: {
        packetsLost: 200,
        packetsReceived: 1000,
        bytesReceived: 1000,
      },
      video: {
        packetsLost: 200,
        packetsReceived: 1000,
        bytesReceived: 1000,
        frameRate: 30,
      },
      timestamp: 1000,
    };
  }));

  it('triggers onStats with the right stats', () => {
    // getStats should have been called once
    expect(mockSubscriber.getStats.calls.count()).toBe(1);
    // Fire the getStats callback with the mockStats
    mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats);
    expect(onStats).toHaveBeenCalled();
    // onStats should have been called with the right stats
    expect(onStats.calls.mostRecent().args[0]).toEqual({
      width: 200,
      height: 200,
      audio: mockStats.audio,
      video: mockStats.video,
      audioPacketLoss: '20.00',
      videoPacketLoss: '20.00',
      audioBitrate: '0',
      videoBitrate: '0',
      timestamp: mockStats.timestamp,
    });

    // After 2 seconds
    $interval.flush(2000);
    // getStats should be called again
    expect(mockSubscriber.getStats.calls.count()).toBe(2);

    const mockStats2 = {
      audio: {
        packetsLost: 300,
        packetsReceived: 1000,
        bytesReceived: 2000,
      },
      video: {
        packetsLost: 300,
        packetsReceived: 1000,
        bytesReceived: 2000,
        frameRate: 30,
      },
      timestamp: 2000,
    };

    // Fire the getStats callback with the new mockStats
    mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats2);
    expect(onStats.calls.mostRecent().args[0]).toEqual({
      width: 200,
      height: 200,
      audio: mockStats2.audio,
      video: mockStats2.video,
      audioPacketLoss: '30.00',
      videoPacketLoss: '30.00',
      audioBitrate: '8',
      videoBitrate: '8',
      timestamp: mockStats2.timestamp,
    });

    $interval.flush(2000);
    expect(mockSubscriber.getStats.calls.count()).toBe(3);
  });

  it('works if you have no audio stats eg. for screensharing', () => {
    delete mockStats.audio;
    // Fire the getStats callback with the mockStats without audio
    expect(() => {
      mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats);
    }).not.toThrow();

    expect(onStats.calls.mostRecent().args[0]).toEqual({
      width: 200,
      height: 200,
      video: mockStats.video,
      videoPacketLoss: '20.00',
      videoBitrate: '0',
      timestamp: mockStats.timestamp,
    });
  });

  it('works if you have no video stats', () => {
    delete mockStats.video;
    // Fire the getStats callback with the mockStats without video
    expect(() => {
      mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats);
    }).not.toThrow();

    expect(onStats.calls.mostRecent().args[0]).toEqual({
      width: 200,
      height: 200,
      audio: mockStats.audio,
      audioPacketLoss: '20.00',
      audioBitrate: '0',
      timestamp: mockStats.timestamp,
    });
  });

  it('handles if it previously did not have audio and now it does', () => {
    delete mockStats.audio;
    // Fire the getStats callback with the mockStats without audio
    mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats);

    const mockStats2 = {
      audio: {
        packetsLost: 300,
        packetsReceived: 1000,
        bytesReceived: 2000,
      },
      video: {
        packetsLost: 300,
        packetsReceived: 1000,
        bytesReceived: 2000,
        frameRate: 30,
      },
      timestamp: 2000,
    };

    $interval.flush(2000);

    // Fire the getStats callback with the new mockStats
    expect(() => {
      mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats2);
    }).not.toThrow();
    expect(onStats.calls.mostRecent().args[0]).toEqual({
      width: 200,
      height: 200,
      audio: mockStats2.audio,
      video: mockStats2.video,
      audioPacketLoss: '30.00',
      videoPacketLoss: '30.00',
      audioBitrate: '16',
      videoBitrate: '8',
      timestamp: mockStats2.timestamp,
    });
  });

  it('handles if it previously did not have video and now it does', () => {
    delete mockStats.video;
    // Fire the getStats callback with the mockStats without video
    mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats);

    $interval.flush(2000);

    const mockStats2 = {
      audio: {
        packetsLost: 300,
        packetsReceived: 1000,
        bytesReceived: 2000,
      },
      video: {
        packetsLost: 300,
        packetsReceived: 1000,
        bytesReceived: 2000,
        frameRate: 30,
      },
      timestamp: 2000,
    };

    // Fire the getStats callback with the new mockStats
    expect(() => {
      mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats2);
    }).not.toThrow();
    expect(onStats.calls.mostRecent().args[0]).toEqual({
      width: 200,
      height: 200,
      audio: mockStats2.audio,
      video: mockStats2.video,
      audioPacketLoss: '30.00',
      videoPacketLoss: '30.00',
      audioBitrate: '8',
      videoBitrate: '16',
      timestamp: mockStats2.timestamp,
    });
  });

  it('removeSubscriber cancels the interval', () => {
    spyOn($interval, 'cancel');
    StatsService.removeSubscriber(mockSubscriber.id);
    expect($interval.cancel).toHaveBeenCalled();
  });
});
