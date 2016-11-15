describe('publishErrors', function() {
  var scope, element, mockError, mockPublisher;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(function ($rootScope, $compile) {
    mockError = {
      message: 'mockErrorMessage'
    };
    mockPublisher = {
      id: 'facePublisher'
    };
    scope = $rootScope.$new();
    scope.togglePublish = jasmine.createSpy('togglePublish');
    element = '<publish-errors></publish-errors>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('should display an error when there is an otPublisherError event', function() {
    expect(scope.publishError).not.toBeDefined();
    scope.$emit('otPublisherError', mockError, mockPublisher);
    expect(scope.publishError).toEqual(mockError.message);
    expect(element.html()).toContain(mockError.message);
  });

  it('should toggle the publisher', function() {
    expect(scope.togglePublish).not.toHaveBeenCalled();
    scope.$emit('otPublisherError', mockError, mockPublisher);
    expect(scope.togglePublish).toHaveBeenCalled();
  });

  it('should set mouseMove to true', function() {
    scope.mouseMove = false;
    scope.$emit('otPublisherError', mockError, mockPublisher);
    expect(scope.mouseMove).toBe(true);
  });

  it('should do nothing if we get an error on a different publisher', function() {
    scope.$emit('otPublisherError', mockError, {id:'screenPublisher'});
    expect(scope.publishError).not.toBeDefined();
    expect(scope.togglePublish).not.toHaveBeenCalled();
    expect(scope.mouseMove).not.toBeDefined();
  });
});
