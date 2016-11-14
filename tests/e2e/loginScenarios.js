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

  var verifyURL = function(expectedURL) {
    if (browser.browserName !== 'firefox') {
      // fixme: for some reason Firefox sometimes gives an error about not being able to
      // sync with the page
      expect(browser.getCurrentUrl().then(function (url) {
        // For some reason in IE sometimes when you run lots of tests
        // the whole URL isn't there
        return (expectedURL).indexOf(url) === 0;
      })).toBe(true);
    }
  };

  var roomField = element(by.model('room')),
    submit = element(by.css('#joinRoomBtn'));

  xit('should go to a room when you click the join button', function () {
    roomField.sendKeys(roomName);
    submit.click();
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + roomName);
  });

  it('should go to a room when you submit the form', function () {
    roomField.sendKeys(roomName);
    roomField.submit();
    verifyURL(browser.baseUrl + roomName);
  });

  describe('advanced options', function() {
    beforeEach(function() {
      expect(element(by.css('#advanced')).isDisplayed()).toBe(false);
      element(by.css('#advancedLink a')).click();
      expect(element(by.css('#advanced')).isDisplayed()).toBe(true);
    });

    describe('p2p checkbox', function () {
      var p2p;

      beforeEach(function() {
        p2p = element(by.model('p2p'));
      });

      it('should add and remove p2p to the name when you click it', function () {
        roomField.sendKeys(roomName);
        p2p.click();
        expect(roomField.getAttribute('value')).toBe(roomName + 'p2p');
        p2p.click();
        expect(roomField.getAttribute('value')).toBe(roomName);
        // should check when you enter p2p into the input field
        roomField.sendKeys('p2p');
        browser.wait(function () {
          return p2p.getAttribute('checked');
        });
      });
    });

    describe('room type options', function () {
      var whiteboard, screenshare;

      beforeEach(function() {
        whiteboard = element(by.css('input[value="whiteboard"]'));
        screenshare = element(by.css('input[value="screen"]'));
      });

      it('loads the right URL when whiteboard is selected', function () {
        roomField.sendKeys(roomName);
        whiteboard.click();
        roomField.submit();

        verifyURL(browser.baseUrl + roomName + '/whiteboard');
      });

      it('loads the right URL when screenshare is selected', function () {
        roomField.sendKeys(roomName);
        screenshare.click();
        roomField.submit();

        verifyURL(browser.baseUrl + roomName + '/screen');
      });
    });
  });
});
