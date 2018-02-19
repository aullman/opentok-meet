/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
const uuid = require('uuid');

describe('using textchat', () => {
  let roomName,
    roomURL,
    textchat;
  beforeEach(() => {
    while (!roomName || roomName.indexOf('p2p') > -1) {
      // Don't want the roomname to have p2p in it or it will be a p2p room
      roomName = uuid.v1();
    }
    browser.getCapabilities().then((cap) => {
      browser.browserName = cap.get('browserName');
      roomURL = roomName;
      roomURL = `/${roomURL}`;
      browser.get(roomURL);
    });
    textchat = element(by.css('opentok-textchat'));
    browser.wait(() => textchat.isPresent(), 5000);
  });

  afterEach(() => {
    roomName = roomURL = null;
  });

  it('shows and hides when you click the button', () => {
    expect(textchat.isDisplayed()).toEqual(false);
    const showTextchatButton = element(by.css('#showTextchatButton'));
    browser.actions().mouseMove(showTextchatButton).perform();
    showTextchatButton.click();
    browser.wait(() => textchat.isDisplayed(), 5000);
    showTextchatButton.click();
    browser.wait(() => textchat.isDisplayed().then(displayed => !displayed), 5000);
    showTextchatButton.click();
    // x button in the top right works
    const closeTextchatButton = element(by.css('#closeTextchat'));
    browser.wait(() => closeTextchatButton.isDisplayed(), 5000);
    closeTextchatButton.click();
    browser.wait(() => textchat.isDisplayed().then(displayed => !displayed), 5000);
  });

  describe('with 2 browsers', () => {
    let secondBrowser,
      secondTextchat;

    beforeEach(() => {
      secondBrowser = browser.forkNewDriverInstance(true);
      secondTextchat = secondBrowser.element(by.css('opentok-textchat'));
      secondBrowser.wait(() => secondTextchat.isPresent(), 5000);
    });

    afterEach(() => {
      if (secondBrowser) {
        secondBrowser.quit();
      }
    });

    it('can send messages and shows the unread indicator', () => {
      const secondTextchatButton = secondBrowser.element(by.css('#showTextchatButton'));
      secondTextchatButton.click();
      browser.wait(() => secondTextchat.isDisplayed(), 5000);
      const secondTextInput = secondBrowser.element(by.css('opentok-textchat form input[type="text"]'));
      secondTextInput.sendKeys('foo');
      secondTextInput.submit();

      // Wait for unread indicator
      browser.wait(() => element(by.css('body.mouse-move .unread-indicator.unread #showTextchatButton'))
        .isPresent(), 10000);

      const textchatButton = element(by.css('#showTextchatButton'));
      textchatButton.click();

      browser.wait(() => element(by.css('opentok-textchat .messageText')).isPresent());

      expect(element(by.css('opentok-textchat .messageText .body')).getInnerHtml()).toContain('foo');
    });
  });
});
