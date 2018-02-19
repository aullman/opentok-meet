const angular = require('angular');
require('../../src/js/app.js');

describe('NotificationService', () => {
  let NotificationService;
  let OTSession;
  let windowMock;
  let mockSession;
  let Push;

  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(() => {
    mockSession = {
      connection: {
        connectionId: 'fake-connection-id',
      },
    };
    OT.$.eventing(mockSession);
    spyOn(mockSession, 'on').and.callThrough();
    windowMock = jasmine.createSpyObj('window', ['addEventListener', 'focus']);
    angular.mock.module(($provide) => {
      $provide.value('$window', windowMock);
    });
    inject((_NotificationService_, _OTSession_, _Push_) => {
      NotificationService = _NotificationService_;
      OTSession = _OTSession_;
      OTSession.session = mockSession;
      Push = _Push_;
    });
  });

  it('listens for blur and focus events on the window', () => {
    expect(windowMock.addEventListener).toHaveBeenCalledWith('blur', jasmine.any(Function));
    expect(windowMock.addEventListener).toHaveBeenCalledWith('focus', jasmine.any(Function));
  });

  it('requests permission if it is not granted', () => {
    spyOn(Push.Permission, 'has').and.callFake(() => false);
    spyOn(Push.Permission, 'request');
    NotificationService.init();
    expect(Push.Permission.request).toHaveBeenCalled();
  });

  describe('when permission granted', () => {
    beforeEach(() => {
      spyOn(Push.Permission, 'has').and.callFake(() => true);
    });

    it('listens for connectionCreated on a session that is already there', () => {
      OTSession.session = mockSession;
      NotificationService.init();
      expect(mockSession.on).toHaveBeenCalledWith('connectionCreated', jasmine.any(Function));
    });

    it('listens for connectionCreated on a session that created later', (done) => {
      NotificationService.init();
      OTSession.session = mockSession;
      OTSession.trigger('init');
      setTimeout(() => {
        expect(mockSession.on).toHaveBeenCalledWith('connectionCreated', jasmine.any(Function));
        done();
      });
    });

    describe('when the window is not focused', () => {
      beforeEach(() => {
        OTSession.session = mockSession;
        NotificationService.init();
        // Find the listener for 'blur' and make the window not focused
        expect(windowMock.addEventListener.calls.first().args[0]).toBe('blur');
        const blurListener = windowMock.addEventListener.calls.first().args[1];
        blurListener();
      });

      it(
        'triggers a notification when you get a connectionCreated and the window is not focused',
        (done) => {
          spyOn(Push, 'create').and.callFake((title, opts) => {
            expect(title).toEqual('New Participant');
            expect(opts).toEqual(jasmine.objectContaining({
              body: 'Someone joined your meeting',
              icon: '/icon.png',
              timeout: 5000,
              tag: jasmine.any(String),
            }));
            done();
          });
          mockSession.trigger('connectionCreated', { connection: { connectionId: 'mock' } });
        },
      );

      it('does not trigger a notification for your own connectionCreated', (done) => {
        spyOn(Push, 'create');
        mockSession.trigger('connectionCreated', { connection: mockSession.connection });
        setTimeout(() => {
          expect(Push.create).not.toHaveBeenCalled();
          done();
        });
      });

      it('focuses the window and closes when you click on it', (done) => {
        spyOn(Push, 'create').and.callFake((title, opts) => {
          const mockThis = {
            close() {
              expect(windowMock.focus).toHaveBeenCalled();
              done();
            },
          };
          opts.onClick.call(mockThis);
        });
        mockSession.trigger('connectionCreated', { connection: { connectionId: 'mock' } });
      });
    });
  });
});
