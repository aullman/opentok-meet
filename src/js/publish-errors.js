angular.module('opentok-meet').directive('publishErrors', function () {
  return {
    restrict: 'E',
    template: '<div id="publishError" class="statusMessage" ng-if="publishError">' +
    'Publish Failed {{publishError}}</div>',
    controller: ['$scope', function ($scope) {
      $scope.$on('otPublisherError', function(event, err, publisher) {
        if (publisher.id === 'facePublisher') {
          $scope.publishError = err.message;
          $scope.mouseMove = true;
          $scope.togglePublish();
          $scope.$apply();
        }
      });
    }]
  };
});
