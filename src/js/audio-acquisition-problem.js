require('../css/audio-acquisition-problem.css');

angular.module('opentok-meet').directive('audioAcquisitionProblem',
  ['OTSession', '$timeout', '$window', function(OTSession, $timeout, $window) {
    return {
      restrict: 'E',
      template: '<i class="ion-alert-circled" title="Warning: audio acquisition problem ' +
      'you may need to quit and restart your browser" ng-show="showAlert"></i>',
      link: function(scope, element, attrs) {
        scope.showAlert = false;
        $timeout(function() {
          var publisher = OTSession.publishers.filter(function (el) {
            return el.id === attrs.publisherId;
          })[0];
          // $window.alert(publisher);
          publisher.on('audioAcquisitionProblem', function() {
            scope.showAlert = true;
            scope.$apply();
            $window.alert('Warning: audio acquisition problem you may need to quit and restart ' +
            'your browser. If you are seeing this message please contact broken@tokbox.com.');
          });
        });
      }
    };
  }]);
