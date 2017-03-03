/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
var uuid = require('uuid');
describe('Login', function() {
  var roomName;
  beforeEach(function () {
    while(!roomName || roomName.indexOf('p2p') > -1) {
      // Don't want the roomname to have p2p in it or it will be a p2p room
      roomName = uuid.v1();
    }
    browser.getCapabilities().then(function (cap) {
      browser.browserName = cap.get('browserName');
    });
    browser.get('');
  });

  describe('h264 and dtx checkbox', function () {
    var h264, dtx, roomField, submit;

    beforeEach(function() {
      element(by.css('#advancedLink a')).click();
      roomField = element(by.model('room'));
      submit = element(by.css('#joinRoomBtn'));
      h264 = element(by.model('h264'));
      dtx = element(by.model('dtx'));
    });

    it('should add the h264 parameter on the end of the url', function () {
      roomField.sendKeys(roomName);
      h264.click();
      submit.click();
      expect(browser.getCurrentUrl()).toBe(browser.baseUrl + roomName + '?h264=true');
    });

    it('should add the dtx parameter on the end of the url', function () {
      roomField.sendKeys(roomName);
      dtx.click();
      submit.click();
      expect(browser.getCurrentUrl()).toBe(browser.baseUrl + roomName + '?dtx=true');
    });

    it('should add the dtx and h264 parameters when both are selected', function () {
      roomField.sendKeys(roomName);
      dtx.click();
      h264.click();
      submit.click();
      expect(browser.getCurrentUrl()).toBe(browser.baseUrl + roomName + '?h264=true&dtx=true');
    });
  });
});
