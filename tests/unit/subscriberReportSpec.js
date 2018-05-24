const angular = require('angular');

require('../../src/js/app.js');

describe('subscriber-report', () => {
  let scope;
  let element;
  const mockStream = {};
  let OTSession;
  let mockSubscriber;
  let $timeout;
  const room = 'mockRoom';
  const baseURL = 'https://mock.url/';

  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(angular.mock.module(($provide) => {
    $provide.value('room', room);
    $provide.value('baseURL', baseURL);
  }));

  beforeEach(inject(($rootScope, $compile, _OTSession_, _ReportService_, _$timeout_) => {
    OTSession = _OTSession_;
    OTSession.session = {
      id: 'mockSessionId',
      connection: { id: 'mockConnectionId' },
      getSubscribersForStream() {},
    };
    $timeout = _$timeout_;
    mockSubscriber = jasmine.createSpyObj('Subscriber', ['getStats', 'setStyle']);
    mockSubscriber.session = OTSession.session;
    mockSubscriber.id = 'mockId';
    mockSubscriber.widgetId = 'mockWidgetId';
    spyOn(OTSession.session, 'getSubscribersForStream').and.callFake(() => [mockSubscriber]);
    scope = $rootScope.$new();
    element = '<subscriber-report stream="stream"></subscriber-report>';
    scope.stream = mockStream;
    element = $compile(element)(scope);
    scope.$digest();
    $timeout.flush();
  }));

  it('calls OTSession.session.getSubscribersForStream', () => {
    expect(OTSession.session.getSubscribersForStream).toHaveBeenCalledWith(mockStream);
  });

  describe('showing the report form', () => {
    let reportBtn;
    beforeEach(() => {
      expect(scope.$$childHead.showReport).toBeFalsy();
      reportBtn = element.find('button.show-report-btn');
      reportBtn.triggerHandler({ type: 'click' });
    });
    it('toggles showReport and buttonDisplayMode on click', () => {
      expect(scope.$$childHead.showReport).toBe(true);
      expect(mockSubscriber.setStyle).toHaveBeenCalledWith({ buttonDisplayMode: 'on' });
      reportBtn.triggerHandler({ type: 'click' });
      expect(scope.$$childHead.showReport).toBe(false);
      expect(mockSubscriber.setStyle).toHaveBeenCalledWith({ buttonDisplayMode: 'auto' });
    });

    xit('logs to Analytics when you click the send button', (done) => {
      scope.$$childHead.report.audioScore = '5';
      scope.$$childHead.report.videoScore = '1';
      scope.$$childHead.report.description = 'mockDescription';

      spyOn(window.OT.analytics, 'logEvent').and.callFake((event) => {
        expect(event).toEqual(jasmine.objectContaining({
          action: 'SubscriberQuality',
          sessionId: 'mockSessionId',
          connectionId: 'mockConnectionId',
          subscriberId: 'mockWidgetId',
          audioScore: '5',
          videoScore: '1',
          description: 'mockDescription',
        }));
        done();
      });
      const sendBtn = element.find('button.send-report-btn');
      sendBtn.triggerHandler({ type: 'click' });
    });
  });
});
