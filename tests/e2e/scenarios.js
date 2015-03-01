/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('OpenTok Meet App', function() {

  describe('Login', function () {
    beforeEach(function () {
      browser.get('');
    });
    
    var roomField = element(by.model('room')),
      submit = element(by.css('#joinRoomBtn'));
    
    it('should go to a room when you click the join button', function () {
      roomField.sendKeys('testRoom');
      submit.click();
      
      expect(browser.getLocationAbsUrl()).toBe(browser.baseUrl + 'testRoom');
    });
    
    it('should go to a room when you submit the form', function () {
      roomField.sendKeys('testRoom');
      roomField.submit();
      
      expect(browser.getLocationAbsUrl()).toBe(browser.baseUrl + 'testRoom');
    });
  });

  describe('Room', function() {

    beforeEach(function() {
      browser.get('testRoom');
    });
    
    it('should have the right title', function () {
      expect(browser.getTitle()).toEqual('OpenTok Meet : testRoom');
    });
    
    describe('publisher', function () {
      var publisher = element(by.css('div#facePublisher'));
      it('is displayed', function () {
        publisher.isPresent();
        publisher.isDisplayed();
      });
      
      it('contains a video element', function () {
        expect(publisher.element(by.css('video'))).toBeDefined();
      });
      
      it('moves when it is dragged', function (done) {
        publisher.getLocation().then(function (oldLocation) {
          browser.actions().dragAndDrop(publisher, element(by.css('body'))).perform();
          publisher.getLocation().then(function (newLocation) {
            expect(newLocation.x).not.toBe(oldLocation.x);
            expect(newLocation.y).not.toBe(oldLocation.y);
            done();
          });
        });
      });
    });
    
  });
});
