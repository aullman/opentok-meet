describe('publishErrors', () => {
  let scope;
  let element;
  let mockError;
  let mockPublisher;
  beforeEach(angular.mock.module('opentok-meet'));
  beforeEach(inject(($rootScope, $compile) => {
    mockError = {
      message: 'mockErrorMessage',
    };
    mockPublisher = {
      id: 'facePublisher',
    };
    scope = $rootScope.$new();
    scope.togglePublish = jasmine.createSpy('togglePublish');
    element = '<ot-errors></ot-errors>';
    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('should display an error when there is an otPublisherError event', () => {
    expect(scope.errorMessage).not.toBeDefined();
    scope.$emit('otPublisherError', mockError, mockPublisher);
    expect(scope.errorMessage).toEqual(`Publish Error: ${mockError.message}`);
    expect(element.html()).toContain(mockError.message);
  });

  it('should toggle the publisher', () => {
    expect(scope.togglePublish).not.toHaveBeenCalled();
    scope.$emit('otPublisherError', mockError, mockPublisher);
    expect(scope.togglePublish).toHaveBeenCalled();
  });

  it('should set mouseMove to true', () => {
    scope.mouseMove = false;
    scope.$emit('otPublisherError', mockError, mockPublisher);
    expect(scope.mouseMove).toBe(true);
  });

  it('should do nothing if we get an error on a different publisher', () => {
    scope.$emit('otPublisherError', mockError, { id: 'screenPublisher' });
    expect(scope.publishError).not.toBeDefined();
    expect(scope.togglePublish).not.toHaveBeenCalled();
    expect(scope.mouseMove).not.toBeDefined();
  });

  it('should show an error for connect errors too', () => {
    expect(scope.errorMessage).not.toBeDefined();
    scope.$emit('otError', mockError);
    expect(scope.errorMessage).toEqual(`Connect Error: ${mockError.message}`);
    expect(element.html()).toContain(mockError.message);
  });
});
