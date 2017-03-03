/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
var uuid = require('uuid');
describe('H264', function() {
  var roomName;
  beforeEach(function () {
    while(!roomName || roomName.indexOf('p2p') > -1) {
      // Don't want the roomname to have p2p in it or it will be a p2p room
      roomName = uuid.v1();
    }
    browser.getCapabilities().then(function (cap) {
      browser.browserName = cap.get('browserName');
    });
  });

  describe('h264 and dtx checkbox in login screen', function () {
    var h264, dtx, roomField, submit;

    beforeEach(function() {
      browser.get('');
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

  describe('with 2 participants', function() {
    var secondBrowser;
    beforeEach(function() {
      browser.get('/' + roomName + '?h264=true');
      secondBrowser = browser.forkNewDriverInstance(true);
      secondBrowser.browserName = browser.browserName;
    });

    it('connects and subscribes successfully', function() {
      browser.wait(function () {
        return element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element')).isPresent();
      }, 20000);
      secondBrowser.wait(function () {
        return secondBrowser.element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element'))
        .isPresent();
      }, 20000);
    });
  });
});
