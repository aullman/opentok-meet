/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
var uuid = require('uuid');
describe('using textchat', function() {
  var roomName, roomURL, textchat;
  beforeEach(function () {
    while(!roomName || roomName.indexOf('p2p') > -1) {
      // Don't want the roomname to have p2p in it or it will be a p2p room
      roomName = uuid.v1();
    }
    browser.getCapabilities().then(function (cap) {
      browser.browserName = cap.get('browserName');
      roomURL = roomName;
      roomURL = '/' + roomURL;
      browser.get(roomURL);
    });
    textchat = element(by.css('opentok-textchat'));
    browser.wait(function () {
      return textchat.isPresent();
    }, 5000);
  });

  afterEach(function () {
    roomName = roomURL = null;
  });

  it('shows and hides when you click the button', function() {
    expect(textchat.isDisplayed()).toEqual(false);
    var showTextchatButton = element(by.css('#showTextchatButton'));
    browser.actions().mouseMove(showTextchatButton).perform();
    showTextchatButton.click();
    browser.wait(function () {
      return textchat.isDisplayed();
    }, 5000);
    showTextchatButton.click();
    browser.wait(function () {
      return textchat.isDisplayed().then(function(displayed) {
        return !displayed;
      });
    }, 5000);
    showTextchatButton.click();
    // x button in the top right works
    var closeTextchatButton = element(by.css('#closeTextchat'));
    browser.wait(function () {
      return closeTextchatButton.isDisplayed();
    }, 5000);
    closeTextchatButton.click();
    browser.wait(function () {
      return textchat.isDisplayed().then(function(displayed) {
        return !displayed;
      });
    }, 5000);
  });

  describe('with 2 browsers', function() {
    var secondBrowser, secondTextchat;

    beforeEach(function() {
      secondBrowser = browser.forkNewDriverInstance(true);
      secondTextchat = secondBrowser.element(by.css('opentok-textchat'));
      secondBrowser.wait(function() {
        return secondTextchat.isPresent();
      }, 5000);
    });

    afterEach(function() {
      if (secondBrowser) {
        secondBrowser.quit();
      }
    });

    it('can send messages and shows the unread indicator', function() {
      var secondTextchatButton = secondBrowser.element(by.css('#showTextchatButton'));
      secondTextchatButton.click();
      browser.wait(function () {
        return secondTextchat.isDisplayed();
      }, 5000);
      var secondTextInput = secondBrowser.element(by.css('opentok-textchat form input[type="text"]'));
      secondTextInput.sendKeys('foo');
      secondTextInput.submit();

      // Wait for unread indicator
      browser.wait(function () {
        return element(by.css('body.mouse-move .unread-indicator.unread #showTextchatButton'))
          .isPresent();
      }, 10000);

      var textchatButton = element(by.css('#showTextchatButton'));
      textchatButton.click();

      browser.wait(function() {
        return element(by.css('opentok-textchat .messageText')).isPresent();
      });

      expect(element(by.css('opentok-textchat .messageText .body')).getInnerHtml()).toContain('foo');
    });
  });
});
