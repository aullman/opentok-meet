/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
const uuid = require('uuid');

describe('Login', () => {
  let roomName;
  beforeEach(() => {
    while (!roomName || roomName.indexOf('p2p') > -1) {
      // Don't want the roomname to have p2p in it or it will be a p2p room
      roomName = uuid.v1();
    }
    browser.getCapabilities().then((cap) => {
      browser.browserName = cap.get('browserName');
    });
    browser.get('');
  });

  const verifyURL = (expectedURL) => {
    if (browser.browserName !== 'firefox') {
      // fixme: for some reason Firefox sometimes gives an error about not being able to
      // sync with the page
      expect(browser.getCurrentUrl().then(url =>
        // For some reason in IE sometimes when you run lots of tests
        // the whole URL isn't there
        (expectedURL).indexOf(url) === 0)).toBe(true);
    }
  };

  const roomField = element(by.model('room'));
  const submit = element(by.css('#joinRoomBtn'));

  xit('should go to a room when you click the join button', () => {
    roomField.sendKeys(roomName);
    submit.click();
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + roomName);
  });

  it('should go to a room when you submit the form', () => {
    roomField.sendKeys(roomName);
    roomField.submit();
    verifyURL(browser.baseUrl + roomName);
  });

  describe('advanced options', () => {
    beforeEach(() => {
      expect(element(by.css('#advanced')).isDisplayed()).toBe(false);
      element(by.css('#advancedLink a')).click();
      expect(element(by.css('#advanced')).isDisplayed()).toBe(true);
    });

    describe('p2p checkbox', () => {
      let p2p;

      beforeEach(() => {
        p2p = element(by.model('p2p'));
      });

      it('should add and remove p2p to the name when you click it', () => {
        roomField.sendKeys(roomName);
        p2p.click();
        expect(roomField.getAttribute('value')).toBe(`${roomName}p2p`);
        p2p.click();
        expect(roomField.getAttribute('value')).toBe(roomName);
        // should check when you enter p2p into the input field
        roomField.sendKeys('p2p');
        browser.wait(() => p2p.getAttribute('checked'));
      });
    });

    describe('room type options', () => {
      let whiteboard;
      let screenshare;

      beforeEach(() => {
        whiteboard = element(by.css('input[value="whiteboard"]'));
        screenshare = element(by.css('input[value="screen"]'));
      });

      it('loads the right URL when whiteboard is selected', () => {
        roomField.sendKeys(roomName);
        whiteboard.click();
        roomField.submit();

        verifyURL(`${browser.baseUrl + roomName}/whiteboard`);
      });

      it('loads the right URL when screenshare is selected', () => {
        roomField.sendKeys(roomName);
        screenshare.click();
        roomField.submit();

        verifyURL(`${browser.baseUrl + roomName}/screen`);
      });
    });
  });
});
