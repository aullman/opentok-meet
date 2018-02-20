/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
const uuid = require('uuid');

describe('using the collaborative editor', () => {
  let roomName;
  let roomURL;
  let secondBrowser;
  beforeEach(() => {
    while (!roomName || roomName.indexOf('p2p') > -1) {
      // Don't want the roomname to have p2p in it or it will be a p2p room
      roomName = uuid.v1();
    }
    roomURL = roomName;
    roomURL = `/${roomURL}`;
    browser.get(roomURL);
  });

  afterEach(() => {
    roomName = null;
    roomURL = null;
    if (secondBrowser) {
      secondBrowser.quit();
    }
  });

  describe('using the collaborative editor', () => {
    it('text editing works', (done) => {
      browser.wait(() => element(by.css('ot-editor')).isPresent(), 5000);
      const firstShowEditorBtn = element(by.css('#showEditorBtn'));
      browser.actions().mouseMove(firstShowEditorBtn).perform();
      firstShowEditorBtn.click();
      browser.wait(() => element(by.css('ot-editor .opentok-editor')).isDisplayed(), 5000);

      browser.sleep(2000);
      // enter text into first browser
      const firstBrowserText = element(by.css('.CodeMirror-code pre .cm-comment'));
      expect(firstBrowserText.isPresent()).toBe(true);
      browser.actions().mouseDown(firstBrowserText).mouseUp().perform();
      browser.actions().sendKeys('foo').sendKeys('bar').perform();
      browser.wait(() => firstBrowserText.getInnerHtml().then(innerHTML => innerHTML.indexOf('bar') > -1), 2000);

      secondBrowser = browser.forkNewDriverInstance(true);
      // Wait for flashing red dot indicator
      secondBrowser.wait(() => secondBrowser.element(by.css('body.mouse-move .unread-indicator.unread #showEditorBtn'))
          .isPresent(), 10000);
      secondBrowser.element(by.css('button#showEditorBtn')).click();

      secondBrowser.wait(() => secondBrowser.element(by.css('ot-layout ot-editor .opentok-editor')).isDisplayed(), 5000);

      secondBrowser.sleep(2000);
      // enter text into second browser
      const secondBrowserText = secondBrowser.element(by.css('.CodeMirror-code pre span.cm-comment'));
      expect(secondBrowserText.isPresent()).toBe(true);
      secondBrowser.actions()
        .mouseMove(secondBrowserText)
        .mouseDown(secondBrowserText)
        .mouseUp()
        .perform();
      secondBrowser.actions().sendKeys('hello').sendKeys('world').perform();
      let secondInnerHTML;
      secondBrowser.wait(() => secondBrowserText.getInnerHtml().then((innerHTML) => {
        secondInnerHTML = innerHTML;
        return innerHTML.indexOf('world') > -1;
      }), 2000);
      secondBrowser.sleep(2000).then(() => {
        // wait for text to show up in the first browser
        browser.wait(
          () => firstBrowserText.getInnerHtml().then(innerHTML => innerHTML === secondInnerHTML)
        , 10000);
        done();
      });
    });
  });
});
