/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
var uuid = require('uuid');
fdescribe('Login', function() {
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

    if (browser.browserName !== 'firefox') {
      // fixme: for some reason Firefox sometimes gives an error about not being able to
      // sync with the page
      expect(browser.getCurrentUrl().then(function (url) {
        // For some reason in IE sometimes when you run lots of tests
        // the whole URL isn't there
        return (browser.baseUrl + roomName).indexOf(url) === 0;
      })).toBe(true);
    }
  });

  describe('p2p checkbox', function () {
    var p2p = element(by.model('p2p'));
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
});
