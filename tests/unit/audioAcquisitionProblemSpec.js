var angular = require('angular');
require('angular-mocks');
require('../../src/js/app.js');

describe('audioAcquisitionProblem', function () {
  var scope, element, mockPublisher, OTSession, $window;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(function ($rootScope, $compile, _OTSession_, _$window_) {
    scope = $rootScope.$new();
    OTSession = _OTSession_;
    $window = _$window_;
    spyOn($window, 'alert');
    mockPublisher = jasmine.createSpyObj('Publisher', ['publishVideo']);
    OT.$.eventing(mockPublisher);
    mockPublisher.id = 'mockPublisher';

    element = '<audio-acquisition-problem publisher-id="mockPublisher">' +
      '</audio-acquisition-problem>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('shows the warning icon and and alert when the publisher triggers audioAcquisitionProblem',
    function (done) {
      expect(scope.showAlert).toBe(false);
      OTSession.addPublisher(mockPublisher);
      setTimeout(function() {
        mockPublisher.trigger('audioAcquisitionProblem');
        setTimeout(function() {
          expect(scope.showAlert).toBe(true);
          done();
        });
      });
    }
  );

  it('only triggers an alert once even if you have multiple publishers', function(done) {
    OTSession.addPublisher(mockPublisher);
    OTSession.addPublisher(OT.$.eventing({}));
    OTSession.addPublisher(OT.$.eventing({}));
    setTimeout(function() {
      mockPublisher.trigger('audioAcquisitionProblem');
      setTimeout(function() {
        expect($window.alert.calls.count()).toBe(1);
        done();
      });
    });

  });
});
