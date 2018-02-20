angular.module('opentok-meet').directive('otErrors', () => ({
  restrict: 'E',
  template: '<div id="otError" class="statusMessage" ng-if="errorMessage">' +
    '{{errorMessage}}</div>',
  controller: ['$scope', function controller($scope) {
    const handleErrors = function handleErrors(event, err, publisher) {
      if (publisher && publisher.id !== 'facePublisher') {
        return;
      }
      $scope.errorMessage = err.message;
      $scope.mouseMove = true;
      if (publisher) {
        $scope.errorMessage = `Publish Error: ${$scope.errorMessage}`;
        $scope.togglePublish();
      } else {
        $scope.errorMessage = `Connect Error: ${$scope.errorMessage}`;
      }
      $scope.$apply();
    };
    $scope.$on('otPublisherError', handleErrors);
    $scope.$on('otError', handleErrors);
  }],
}));
