/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
const uuid = require('uuid');

xdescribe('using the whiteboard', () => {
  let roomName,
    roomURL,
    secondBrowser,
    thirdBrowser;
  beforeEach(() => {
    while (!roomName || roomName.indexOf('p2p') > -1) {
      // Don't want the roomname to have p2p in it or it will be a p2p room
      roomName = uuid.v1();
    }
    browser.getCapabilities().then((cap) => {
      browser.browserName = cap.get('browserName');
      roomURL = roomName;
      roomURL = `/${roomURL}`;
    });
  });

  afterEach(() => {
    roomName = roomURL = null;
    if (secondBrowser) {
      secondBrowser.quit();
    }
    if (thirdBrowser) {
      thirdBrowser.quit();
    }
  });

  const getWhiteboardData = function (browser) {
    return browser.driver.executeScript(() => document.querySelector('ot-whiteboard canvas').toDataURL('image/png'));
  };

  const whiteboardTests = function (showButton) {
    return function () {
      browser.wait(() => element(by.css('ot-whiteboard')) && element(by.css('ot-whiteboard')).isPresent(), 5000);
      if (showButton) {
        const firstShowWhiteboardBtn = element(by.css('#showWhiteboardBtn'));
        browser.actions().mouseMove(firstShowWhiteboardBtn).perform();
        firstShowWhiteboardBtn.click();
      }
      browser.wait(() => element(by.css('ot-whiteboard')).isDisplayed(), 5000);
      // draw in the first browser
      const firstBrowserCanvas = element(by.css('ot-whiteboard canvas'));
      expect(firstBrowserCanvas.isPresent()).toBe(true);
      let initialData,
        firstDrawData,
        secondDrawData;
      getWhiteboardData(browser).then((data) => {
        initialData = data;
      });

      secondBrowser = browser.forkNewDriverInstance(true);
      // Show the whiteboard in the second browser
      const secondShowWhiteboardBtn = secondBrowser.element(by.css('#showWhiteboardBtn'));
      if (showButton) {
        secondBrowser.actions().mouseMove(secondShowWhiteboardBtn).perform();
        secondShowWhiteboardBtn.click();
      }
      secondBrowser.wait(() => secondBrowser.element(by.css('ot-whiteboard')) && secondBrowser.element(by.css('ot-whiteboard')).isPresent(), 5000);
      const secondBrowserCanvas = secondBrowser.element(by.css('ot-whiteboard canvas'));
      // Check that the initial data of the second browser is the same as the first
      getWhiteboardData(secondBrowser).then((data) => {
        expect(data).toEqual(initialData);
      }).then(() => {
        // Draw in the second browser
        secondBrowser.actions().mouseMove(secondBrowserCanvas).mouseDown()
          .mouseMove({ x: 0, y: 100 })
          .mouseUp()
          .perform();
        return getWhiteboardData(secondBrowser);
      }).then((data) => {
        firstDrawData = data;
        expect(firstDrawData).not.toEqual(initialData);
        // Wait for the changes to show up on the first browser
        return browser.wait(() => getWhiteboardData(browser).then(data => data === firstDrawData));
      })
        .then(() => {
        // Draw on the first browser
          browser.actions().mouseMove(firstBrowserCanvas).mouseDown()
            .mouseMove({ x: 100, y: 100 })
            .mouseUp()
            .perform();

          return getWhiteboardData(browser);
        })
        .then((data) => {
          secondDrawData = data;
          expect(secondDrawData).not.toEqual(firstDrawData);
          // Wait for the changes to show up on the second browser
          return browser.wait(() => getWhiteboardData(secondBrowser).then(data => data === secondDrawData));
        })
        .then(() => {
          thirdBrowser = browser.forkNewDriverInstance(true);
          // Wait for flashing red dot indicator in the third browser
          if (showButton) {
            thirdBrowser.wait(() => thirdBrowser.element(by.css('body.mouse-move .unread-indicator.unread #showWhiteboardBtn'))
              .isPresent(), 30000);
          }
          browser.wait(() => thirdBrowser.element(by.css('ot-whiteboard')) && thirdBrowser.element(by.css('ot-whiteboard')).isPresent(), 5000);

          return thirdBrowser.wait(() => getWhiteboardData(thirdBrowser).then(data => data === secondDrawData));
        });
    };
  };

  describe('in the room', () => {
    beforeEach(() => {
      browser.get(roomURL);
    });
    it('drawing works', whiteboardTests(true));
  });

  describe('standalone', () => {
    beforeEach(() => {
      browser.get(`${roomURL}/whiteboard`);
    });
    it('drawing works', whiteboardTests(false));
  });
});
