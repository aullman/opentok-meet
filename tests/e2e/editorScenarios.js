/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
var uuid = require('uuid');
describe('using the collaborative editor', function() {
  var roomName, roomURL, secondBrowser;
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
  });

  afterEach(function () {
    roomName = roomURL = null;
    if (secondBrowser) {
      secondBrowser.quit();
    }
  });

  describe('using the collaborative editor', function () {
    it('text editing works', function (done) {
      browser.wait(function () {
        return element(by.css('ot-editor')).isPresent();
      }, 5000);
      var firstShowEditorBtn = element(by.css('#showEditorBtn'));
      browser.actions().mouseMove(firstShowEditorBtn).perform();
      firstShowEditorBtn.click();
      browser.wait(function () {
        return element(by.css('ot-editor .opentok-editor')).isDisplayed();
      }, 5000);

      browser.sleep(2000);
      // enter text into first browser
      var firstBrowserText = element(by.css('.CodeMirror-code pre .cm-comment'));
      expect(firstBrowserText.isPresent()).toBe(true);
      browser.actions().mouseDown(firstBrowserText).mouseUp().perform();
      browser.actions().sendKeys('foo').sendKeys('bar').perform();
      browser.wait(function () {
        return firstBrowserText.getInnerHtml().then(function (innerHTML) {
          return innerHTML.indexOf('bar') > -1;
        });
      }, 2000);

      secondBrowser = browser.forkNewDriverInstance(true);
      // Wait for flashing red dot indicator
      secondBrowser.wait(function () {
        return secondBrowser.element(by.css('body.mouse-move .unread-indicator.unread #showEditorBtn'))
          .isPresent();
      }, 10000);
      secondBrowser.element(by.css('button#showEditorBtn')).click();

      secondBrowser.wait(function () {
        return secondBrowser.element(by.css('ot-layout ot-editor .opentok-editor')).isDisplayed();
      }, 5000);

      secondBrowser.sleep(2000);
      // enter text into second browser
      var secondBrowserText = secondBrowser.element(by.css('.CodeMirror-code pre span.cm-comment'));
      expect(secondBrowserText.isPresent()).toBe(true);
      secondBrowser.actions().mouseMove(secondBrowserText).mouseDown(secondBrowserText)
        .mouseUp().perform();
      secondBrowser.actions().sendKeys('hello').sendKeys('world').perform();
      var secondInnerHTML;
      secondBrowser.wait(function () {
        return secondBrowserText.getInnerHtml().then(function (innerHTML) {
          secondInnerHTML = innerHTML;
          return innerHTML.indexOf('world') > -1;
        });
      }, 2000);
      secondBrowser.sleep(2000).then(function () {
        // wait for text to show up in the first browser
        browser.wait(function () {
          return firstBrowserText.getInnerHtml().then(function (innerHTML) {
            return innerHTML === secondInnerHTML;
          });
        }, 10000);
        done();
      });
    });
  });
});
