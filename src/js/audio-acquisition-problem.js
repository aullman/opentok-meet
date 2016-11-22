require('../css/audio-acquisition-problem.css');

angular.module('opentok-meet').directive('audioAcquisitionProblem',
  ['OTSession', '$window', function(OTSession, $window) {
    return {
      restrict: 'E',
      template: '<i class="ion-alert-circled" title="Warning: audio acquisition problem ' +
      'you may need to quit and restart your browser" ng-show="showAlert"></i>',
      link: function(scope, element, attrs) {
        scope.showAlert = false;

        var listenForIssue = function() {
          var publisher = OTSession.publishers.filter(function (el) {
            return el.id === attrs.publisherId;
          })[0];
          if (publisher) {
            publisher.on('audioAcquisitionProblem', function() {
              scope.showAlert = true;
              scope.$apply();
            });
            OTSession.off('otPublisherAdded', listenForIssue);
          } else {
            OTSession.on('otPublisherAdded', listenForIssue);
            scope.$on('$destroy', function() {
              OTSession.off('otPublisherAdded', listenForIssue);
            });
          }
        };
        listenForIssue();
      }
    };
  }]);
