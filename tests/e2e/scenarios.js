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

  xdescribe('Room', function() {

    beforeEach(function() {
      browser.get('testRoom');
    });
    
    
  });
});
