describe('microphonePicker', () => {
  let scope;
  let mockPublisher;
  let element;
  let button;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(($rootScope) => {
    scope = $rootScope.$new();
    mockPublisher = jasmine.createSpyObj('Publisher', ['on']);
    mockPublisher.getAudioSource = () => ({
      label: 'Device2',
    });
    mockPublisher.setAudioSource = jasmine.createSpy('setAudioSource').and.callFake(() => Promise.resolve());
    mockPublisher.id = 'mockPublisher';
  }));

  const createMicrophonePickerWithMockDevices = (devices) => {
    inject(($compile) => {
      spyOn(OT, 'getDevices').and.callFake((callback) => {
        callback(null, devices);
      });
      scope.getPublisher = () => mockPublisher;
      element = '<microphone-picker publisher="getPublisher()"></microphone-picker>';
      element = $compile(element)(scope);
      button = element.find('button');
      scope.$digest();
    });
  };

  describe('with multiple microphones', () => {
    let list;
    let firstItem;
    let secondItem;
    beforeEach(() => {
      createMicrophonePickerWithMockDevices([{
        kind: 'audioInput',
        deviceId: 'device1',
        label: 'Device1',
      },
      {
        kind: 'audioInput',
        deviceId: 'device2',
        label: 'Device2',
      },
      ]);
      list = element.find('ul');
      firstItem = list.find('li:first-child');
      secondItem = list.find('li:last-child');
    });

    it('The button is shown', () => {
      expect(button.hasClass('ng-hide')).toBe(false);
    });

    it('shows the device list and clicking on a device calls setAudioSource', () => {
      expect(list.hasClass('ng-hide')).toBe(true);
      button.triggerHandler({
        type: 'click',
      });
      expect(list.hasClass('ng-hide')).toBe(false);
      expect(list.find('li').length).toBe(2);

      expect(firstItem.html()).toBe('Device1');
      expect(secondItem.html()).toBe('Device2');
    });

    it('clicking on a device calls setAudioSource', () => {
      expect(mockPublisher.setAudioSource).not.toHaveBeenCalled();
      firstItem.triggerHandler({
        type: 'click',
      });
      expect(mockPublisher.setAudioSource).toHaveBeenCalledWith('device1');

      secondItem.triggerHandler({
        type: 'click',
      });
      expect(mockPublisher.setAudioSource).toHaveBeenCalledWith('device2');
    });

    it('highlights the currently selected device', () => {
      expect(secondItem.hasClass('selected')).toBe(true);
    });
  });

  describe('with one microphone', () => {
    beforeEach(() => {
      createMicrophonePickerWithMockDevices([{
        kind: 'audioInput',
      }]);
    });

    it('The button is not shown', () => {
      expect(button.hasClass('ng-hide')).toBe(true);
    });
  });
});
