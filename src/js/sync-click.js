angular.module('opentok-meet')
  .directive('syncClick', () => ({
    restrict: 'A',
    scope: {
      syncClick: '&',
    },
    link(scope, element) {
      element.on('click', () => {
        scope.syncClick();
      });
    },
  }));
