var angular = require('angular');

require('../../src/js/app.js');

describe('subscriber-report', function() {
  var scope, element, mockStream = {}, OTSession, mockSubscriber, $timeout,
    ReportService;
  var room = 'mockRoom';
  var baseURL = 'https://mock.url/';

  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('room', room);
    $provide.value('baseURL', baseURL);
  }));

  beforeEach(inject(function ($rootScope, $compile, _OTSession_, _ReportService_, _$timeout_) {
    OTSession = _OTSession_;
    OTSession.session = {
      id: 'mockSessionId',
      connection: {id: 'mockConnectionId'},
      getSubscribersForStream: function() {}
    };
    $timeout = _$timeout_;
    ReportService = _ReportService_;
    mockSubscriber = jasmine.createSpyObj('Subscriber', ['getStats', 'setStyle']);
    mockSubscriber.session = OTSession.session;
    mockSubscriber.id = 'mockId';
    mockSubscriber.widgetId = 'mockWidgetId';
    spyOn(OTSession.session, 'getSubscribersForStream').and.callFake(function() {
      return [mockSubscriber];
    });
    scope = $rootScope.$new();
    element = '<subscriber-report stream="stream"></subscriber-report>';
    scope.stream = mockStream;
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();
  }));

  it('calls OTSession.session.getSubscribersForStream', function () {
    expect(OTSession.session.getSubscribersForStream).toHaveBeenCalledWith(mockStream);
  });

  describe('showing the report form', function() {
    var reportBtn;
    beforeEach(function() {
      expect(scope.$$childHead.showReport).toBeFalsy();
      reportBtn = element.find('button.show-report-btn');
      reportBtn.triggerHandler({type: 'click'});
    });
    it('toggles showReport and buttonDisplayMode on click', function () {
      expect(scope.$$childHead.showReport).toBe(true);
      expect(mockSubscriber.setStyle).toHaveBeenCalledWith({buttonDisplayMode: 'on'});
      reportBtn.triggerHandler({type: 'click'});
      expect(scope.$$childHead.showReport).toBe(false);
      expect(mockSubscriber.setStyle).toHaveBeenCalledWith({buttonDisplayMode: 'auto'});
    });

    it('logs to Analytics when you click the send button', function(done) {
      scope.$$childHead.report.audioScore = '5';
      scope.$$childHead.report.videoScore = '1';
      scope.$$childHead.report.description = 'mockDescription';

      spyOn(window.OT.analytics, 'logEvent').and.callFake(function(event) {
        expect(event).toEqual(jasmine.objectContaining({
          action: 'SubscriberQuality',
          sessionId: 'mockSessionId',
          connectionId: 'mockConnectionId',
          subscriberId: 'mockWidgetId',
          audioScore: '5',
          videoScore: '1',
          description: 'mockDescription'
        }));
        done();
      });
      var sendBtn = element.find('button.send-report-btn');
      sendBtn.triggerHandler({type: 'click'});
    });
  });
});
