angular.module('opentok-meet')
  .directive('syncClick', function() {
    return {
      restrict: 'A',
      scope: {
        syncClick: '&'
      },
      link: function(scope, element) {
        element.on('click', function() {
          scope.syncClick();
        });
      }
    };
  });
