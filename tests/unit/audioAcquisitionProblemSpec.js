var angular = require('angular');
require('angular-mocks');
require('../../src/js/app.js');

describe('audioAcquisitionProblem', function () {
  var scope, element, mockPublisher, OTSession, $timeout, $window;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(function ($rootScope, $compile, _OTSession_, _$timeout_, _$window_) {
    scope = $rootScope.$new();
    OTSession = _OTSession_;
    $timeout = _$timeout_;
    $window = _$window_;
    spyOn($window, 'alert');
    mockPublisher = jasmine.createSpyObj('Publisher', ['publishVideo']);
    OT.$.eventing(mockPublisher);
    mockPublisher.id = 'mockPublisher';
    OTSession.publishers = [mockPublisher];

    element = '<audio-acquisition-problem publisher-id="mockPublisher">' +
      '</audio-acquisition-problem>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('shows the warning icon and and alert when the publisher triggers audioAcquisitionProblem',
    function (done) {
      expect(scope.showAlert).toBe(false);
      $timeout.flush();
      expect($window.alert).not.toHaveBeenCalled();
      mockPublisher.trigger('audioAcquisitionProblem');
      setTimeout(function() {
        expect(scope.showAlert).toBe(true);
        expect($window.alert).toHaveBeenCalled();
        done();
      });
    }
  );
});
