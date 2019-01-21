const filterPickerHTML = require('../templates/filter-picker.html');
require('../css/filter-picker.css');

function FilterPickerDirective() {
  function link(scope, element) {
    scope.showFilterList = false;
    scope.filters = ['none', 'sepia', 'invert', 'sketch', 'grayscale', 'blur'];

    scope.toggleFilterList = () => {
      scope.showFilterList = !scope.showFilterList;
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
  }

  return {
    restrict: 'E',
    scope: {
      filter: '=',
    },
    template: filterPickerHTML,
    link,
  };
}

angular.module('opentok-meet').directive('filterPicker', FilterPickerDirective);
