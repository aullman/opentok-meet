const filterPickerHTML = require('../templates/filter-picker.html');
require('../css/filter-picker.css');
const filterous = require('filterous/lib/instaFilters');

function FilterPickerDirective() {
  function link(scope, element) {
    let currentPublisher;
    scope.showFilterList = false;
    scope.filters = ['none', 'brannan', 'xpro2', 'moon', 'nashville', 'lofi', 'helena', '1977'];
    scope.filterImages = null;

    scope.toggleFilterList = () => {
      scope.showFilterList = !scope.showFilterList;

      setTimeout(() => {
        // Do it asynchronously so we don't block
        if (!scope.filterImages) {
          const videoElement = currentPublisher.element.querySelector('video');
          if (videoElement) {
            scope.filterImages = {};
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth / 4;
            canvas.height = videoElement.videoHeight / 4;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            scope.filters.forEach((filter) => {
              setTimeout(() => {
                if (filterous[filter]) {
                  // Make a copy of the ImageData so we don't modify it
                  const imgDataCopy = new ImageData(
                    new Uint8ClampedArray(imgData.data),
                    imgData.width, imgData.height
                  );
                  const filteredImgData = filterous[filter](imgDataCopy);
                  const tmpCanvas = document.createElement('canvas');
                  tmpCanvas.width = canvas.width;
                  tmpCanvas.height = canvas.height;
                  const tmpCtx = tmpCanvas.getContext('2d');
                  tmpCtx.putImageData(filteredImgData, 0, 0);
                  scope.filterImages[filter] = `${tmpCanvas.toDataURL('image/png')}`;
                } else {
                  scope.filterImages[filter] = `${canvas.toDataURL('image/png')}`;
                }
                scope.$apply();
              });
            });
          }
        }
      });
    };

    scope.selectFilter = (f) => {
      scope.filter = f;
      scope.showFilterList = false;
    };

    document.addEventListener('click', (event) => {
      // If they click anywhere outside the picker then hide the list
      if (element.find(event.target).length === 0 &&
        element.find('ul').find(event.target).length === 0) {
        scope.showFilterList = false;
        scope.$apply();
      }
    });

    scope.$watch('publisher', (newValue) => {
      if (newValue === undefined) {
        return;
      }

      currentPublisher = newValue;
    });
  }

  return {
    restrict: 'E',
    scope: {
      filter: '=',
      publisher: '=',
    },
    template: filterPickerHTML,
    link,
  };
}

angular.module('opentok-meet').directive('filterPicker', FilterPickerDirective);
