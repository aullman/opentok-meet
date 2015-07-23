describe('subscriber-stats', function() {
  var scope, element, mockStream = {}, OTSession, mockSubscriber, mockStats;
  beforeEach(module('opentok-meet'));
  beforeEach(inject(function ($rootScope, $compile, _OTSession_) {
    OTSession = _OTSession_;
    OTSession.session = {
      getSubscribersForStream: function() {}
    };
    mockSubscriber = jasmine.createSpyObj('Subscriber', ['getStats']);
    mockSubscriber.videoWidth = function() {
      return 200;
    };
    mockSubscriber.videoHeight = function() {
      return 200;
    };
    spyOn(OTSession.session, 'getSubscribersForStream').and.callFake(function() {
      return [mockSubscriber];
    });
    scope = $rootScope.$new();
    element = '<subscriber-stats stream="stream"></subscriber-stats>';
    scope.stream = mockStream;
    element = $compile(element)(scope);
    scope.$digest();
    mockStats = {
      audio: {
        packetsLost: 200,
        packetsReceived: 1000,
        bytesReceived: 1000
      },
      video: {
        packetsLost: 200,
        packetsReceived: 1000,
        bytesReceived: 1000
      },
      timestamp: 1000
    };
  }));

  it('calls OTSession.session.getSubscribersForStream', function () {
    expect(OTSession.session.getSubscribersForStream).toHaveBeenCalledWith(mockStream);
  });

  it('calls subscriber.getStats', function() {
    expect(mockSubscriber.getStats).toHaveBeenCalled();
  });

  it('sets scope.stats on mouseover and refreshes every second', function(done) {
    // getStats should have been called once
    expect(mockSubscriber.getStats.calls.count()).toBe(1);
    // Fire the getStats callback with the mockStats
    mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats);
    expect(scope.$$childHead.stats).not.toBeDefined();
    // Trigger a mouseover
    var statsBtn = element.find('button');
    statsBtn.triggerHandler({type: 'mouseover'});
    // We mouse'd over so getStats was called again
    expect(mockSubscriber.getStats.calls.count()).toBe(2);
    // stats should be defined now
    expect(scope.$$childHead.stats).toEqual({
      width: 200,
      height: 200,
      audio: mockStats.audio,
      video: mockStats.video,
      audioPacketLoss: '20.00',
      videoPacketLoss: '20.00',
      audioBitrate: '0',
      videoBitrate: '0',
      timestamp: mockStats.timestamp
    });
    
    var mockStats2 = {
      audio: {
        packetsLost: 300,
        packetsReceived: 1000,
        bytesReceived: 2000
      },
      video: {
        packetsLost: 300,
        packetsReceived: 1000,
        bytesReceived: 2000
      },
      timestamp: 2000
    };

    // Fire the getStats callback with the new mockStats
    mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats2);
    expect(scope.$$childHead.stats).toEqual({
      width: 200,
      height: 200,
      audio: mockStats2.audio,
      video: mockStats2.video,
      audioPacketLoss: '30.00',
      videoPacketLoss: '30.00',
      audioBitrate: '8',
      videoBitrate: '8',
      timestamp: mockStats2.timestamp
    });
    

    setTimeout(function() {
      // getStats should have been called a second time
      expect(mockSubscriber.getStats.calls.count()).toBe(3);
      element.triggerHandler({type: 'mouseout'});
      expect(scope.$$childHead.stats).toBe(null);
      done();
    }, 1010);
  });

  it('displays the stats correctly', function() {
    scope.$$childHead.stats = {
      width: 200,
      height: 200,
      audio: mockStats.audio,
      video: mockStats.video,
      audioPacketLoss: '20.00',
      videoPacketLoss: '20.00',
      audioBitrate: '0',
      videoBitrate: '0',
      timestamp: mockStats.timestamp
    };
    scope.$digest();
    expect(element.find('div').html()).toMatch(
      new RegExp('Resolution: 200x200<br>.*' +
      'Audio Packet Loss: 20.00%<br>' +
      'Audio Bitrate: 0 kbps<br>.*' +
      'Video Packet Loss: 20.00%<br>' +
      'Video Bitrate: 0 kbps', 'g')
    );
  });

  it('works if you have no audio stats eg. for screensharing', function() {
    delete mockStats.audio;
    // Fire the getStats callback with the mockStats without audio
    expect(function() {
      mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats);
    }).not.toThrow();
    // Trigger a mouseover
    var statsBtn = element.find('button');
    statsBtn.triggerHandler({type: 'mouseover'});
    // stats should be defined now
    expect(scope.$$childHead.stats).toEqual({
      width: 200,
      height: 200,
      video: mockStats.video,
      videoPacketLoss: '20.00',
      videoBitrate: '0',
      timestamp: mockStats.timestamp
    });
  });

  it('works if you have no video stats', function() {
    delete mockStats.video;
    // Fire the getStats callback with the mockStats without audio
    expect(function() {
      mockSubscriber.getStats.calls.mostRecent().args[0](null, mockStats);
    }).not.toThrow();
    // Trigger a mouseover
    var statsBtn = element.find('button');
    statsBtn.triggerHandler({type: 'mouseover'});
    // stats should be defined now
    expect(scope.$$childHead.stats).toEqual({
      width: 200,
      height: 200,
      audio: mockStats.audio,
      audioPacketLoss: '20.00',
      audioBitrate: '0',
      timestamp: mockStats.timestamp
    });
  });
});