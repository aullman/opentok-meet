const microphonePickerHTML = require('../templates/microphone-picker.html');
require('../css/microphone-picker.css');

function MicrophonePickerDirective() {
  function link(scope, element) {
    let currentPublisher;
    scope.devices = [];
    scope.showDeviceList = false;
    scope.selectedLabel = '';

    const getDevices = (apply = true) => {
      OT.getDevices((err, devices) => {
        scope.devices = devices.filter(device => device.kind === 'audioInput');
        if (currentPublisher && currentPublisher.getAudioSource &&
          currentPublisher.getAudioSource()) {
          scope.selectedLabel = currentPublisher.getAudioSource().label;
        }
        if (apply) {
          scope.$apply();
        }
      });
    };

    scope.setAudioSource = (deviceId) => {
      if (currentPublisher && currentPublisher.setAudioSource) {
        currentPublisher.setAudioSource(deviceId).then(getDevices);
      }
      scope.toggleSelect();
    };

    scope.toggleSelect = () => {
      getDevices(false);
      scope.showDeviceList = !scope.showDeviceList;
    };

    document.addEventListener('click', (event) => {
      // If they click anywhere outside the picker then hide the list
      if (element.find(event.target).length === 0
        && element.find('ul').find(event.target).length === 0) {
        scope.showDeviceList = false;
        scope.$apply();
      }
    });

    scope.$watch('publisher', (newValue) => {
      if (newValue === undefined) {
        return;
      }

      currentPublisher = newValue;
      currentPublisher.on('loaded', getDevices);
      getDevices(false);
    });
  }

  return {
    restrict: 'E',
    scope: {
      publisher: '=',
    },
    template: microphonePickerHTML,
    link,
  };
}

angular.module('opentok-meet').directive('microphonePicker', MicrophonePickerDirective);
