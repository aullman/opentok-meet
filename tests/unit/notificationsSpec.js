var angular = require('angular');
require('../../src/js/app.js');

describe('NotificationService', function() {
  var NotificationService, OTSession, windowMock, mockSession;

  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(function() {
    mockSession = {};
    OT.$.eventing(mockSession);
    spyOn(mockSession, 'on').and.callThrough();
    windowMock = jasmine.createSpyObj('window', ['addEventListener']);
    angular.mock.module(function($provide) {
      $provide.value('$window', windowMock);
    });
    inject(function(_NotificationService_, _OTSession_) {
      NotificationService = _NotificationService_;
      OTSession = _OTSession_;
    });
  });

  it('listens for blur and focus events on the window', function() {
    expect(windowMock.addEventListener).toHaveBeenCalledWith('blur', jasmine.any(Function));
    expect(windowMock.addEventListener).toHaveBeenCalledWith('focus', jasmine.any(Function));
  });

  it('requests permission if it is not granted', function() {
    windowMock.Notification = {
      permission: 'notgranted',
      requestPermission: jasmine.createSpy('requestPermission')
    };
    NotificationService.init();
    expect(windowMock.Notification.requestPermission).toHaveBeenCalledWith(jasmine.any(Function));
  });

  describe('when permission granted', function() {
    beforeEach(function() {
      windowMock.Notification = {
        permission: 'granted'
      };
    });

    it('listens for connectionCreated on a session that is already there', function() {
      OTSession.session = mockSession;
      NotificationService.init();
      expect(mockSession.on).toHaveBeenCalledWith('connectionCreated', jasmine.any(Function));
    });

    it('listens for connectionCreated on a session that created later', function(done) {
      NotificationService.init();
      OTSession.session = mockSession;
      OTSession.trigger('init');
      setTimeout(function() {
        expect(mockSession.on).toHaveBeenCalledWith('connectionCreated', jasmine.any(Function));
        done();
      });
    });

    it('triggers a notification when you get a connectionCreated and the window is not focused',
      function(done) {
        OTSession.session = mockSession;
        NotificationService.init();
        // Find the listener for 'blur' and make the window not focused
        expect(windowMock.addEventListener.calls.first().args[0]).toBe('blur');
        var blurListener = windowMock.addEventListener.calls.first().args[1];
        blurListener();
        windowMock.Notification = function(title, opts) {
          expect(title).toEqual('New Participant');
          expect(opts).toEqual(jasmine.objectContaining({
            body: 'Someone joined your meeting',
            icon: '/icon.png'
          }));
          done();
        };
        mockSession.trigger('connectionCreated');
      });
});
});
