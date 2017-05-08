require('../css/subscriber-report.css');

function SubscriberReport(subscriber) {
  this.subscriber = subscriber;
}

angular.module('opentok-meet').factory('ReportService', [
  function() {
    return {
      report: function(subscriber, report) {
        console.log(subscriber);
        TB.analytics.logEvent({
          action: 'SubscriberQuality',
          sessionId: subscriber.session.id,
          connectionId: subscriber.session.connection.id,
          subscriberId: subscriber.widgetId,
          audioScore: report.audioScore,
          videoScore: report.videoScore,
          description: report.description
        });
      }
    };
  }
]);

//

angular.module('opentok-meet').directive('subscriberReport', ['OTSession', 'ReportService',
  '$timeout', function(OTSession, ReportService, $timeout) {
    return {
      restrict: 'E',
      scope: {
        stream: '='
      },
      template: '<button class="show-report-btn ion-ios7-star-outline" ' +
        'ng-class="{\'show-report\': showReport}"></button>' +
        '<div class="show-report-info" ng-show="showReport">' +
        '<p>Audio Score: <select ng-model="report.audioScore">' +
        '<option value="1">Bad. Very annoying.</option>' +
        '<option value="2">Poor. Annoying.</option>' +
        '<option value="3" selected="selected">Fair. Slightly annoying.</option>' +
        '<option value="4">Good. Not perfect but not annoying.</option>' +
        '<option value="5">Excellent. Imperceptible impairment.</option>' +
        '</select></p>' +
        '<p>Video Score: <select ng-model="report.videoScore">' +
        '<option value="1">Bad. Very annoying.</option>' +
        '<option value="2">Poor. Annoying.</option>' +
        '<option value="3" selected="selected">Fair. Slightly annoying.</option>' +
        '<option value="4">Good. Not perfect but not annoying.</option>' +
        '<option value="5">Excellent. Imperceptible impairment.</option>' +
        '</select></p>' +
        '<p>Other info: <textarea ng-model="report.description" ></textarea></p>' +
        '<button class="send-report-btn">Send</button>' +
        '</div>',
      link: function(scope, element) {
        var subscriber, subscriberId;
        var timeout = $timeout(function () {
          // subscribe hasn't been called yet so we wait a few milliseconds
          subscriber = OTSession.session.getSubscribersForStream(scope.stream)[0];
          subscriberId = subscriber.id;
        }, 100);

        angular.element(element).find('button.show-report-btn').on('click', function() {
          scope.showReport = !scope.showReport;
          subscriber.setStyle({
            buttonDisplayMode: scope.showReport ? 'on' : 'auto'
          });
          scope.$apply();
        });
        angular.element(element).find('button.send-report-btn').on('click', function() {
          ReportService.report(subscriber, scope.report, scope.report);
          scope.showReport = false;
          subscriber.setStyle({
            buttonDisplayMode: scope.showReport ? 'on' : 'auto'
          });
          scope.$apply();
        });
        scope.report = { audioScore: '3', videoScore: '3', description: '' };
      }
    };
  }
]);
