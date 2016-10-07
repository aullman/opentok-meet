/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
var uuid = require('uuid');
describe('using the whiteboard', function() {
  var roomName, roomURL, secondBrowser, thirdBrowser;
  beforeEach(function () {
    while(!roomName || roomName.indexOf('p2p') > -1) {
      // Don't want the roomname to have p2p in it or it will be a p2p room
      roomName = uuid.v1();
    }
    browser.getCapabilities().then(function (cap) {
      browser.browserName = cap.get('browserName');
      roomURL = roomName;
      roomURL = '/' + roomURL;
    });
  });

  afterEach(function () {
    roomName = roomURL = null;
    if (secondBrowser) {
      secondBrowser.quit();
    }
    if (thirdBrowser) {
      thirdBrowser.quit();
    }
  });

  var getWhiteboardData = function(browser) {
    return browser.driver.executeScript(function() {
      return document.querySelector('ot-whiteboard canvas').toDataURL('image/png');
    });
  };

  var whiteboardTests = function(showButton) {
    return function() {
      browser.wait(function () {
        return element(by.css('ot-whiteboard')) && element(by.css('ot-whiteboard')).isPresent();
      }, 5000);
      if (showButton) {
        var firstShowWhiteboardBtn = element(by.css('#showWhiteboardBtn'));
        browser.actions().mouseMove(firstShowWhiteboardBtn).perform();
        firstShowWhiteboardBtn.click();
      }
      browser.wait(function () {
        return element(by.css('ot-whiteboard')).isDisplayed();
      }, 5000);
      // draw in the first browser
      var firstBrowserCanvas = element(by.css('ot-whiteboard canvas'));
      expect(firstBrowserCanvas.isPresent()).toBe(true);
      var initialData, firstDrawData, secondDrawData;
      getWhiteboardData(browser).then(function(data) {
        initialData = data;
      });

      secondBrowser = browser.forkNewDriverInstance(true);
      // Show the whiteboard in the second browser
      var secondShowWhiteboardBtn = secondBrowser.element(by.css('#showWhiteboardBtn'));
      if (showButton) {
        secondBrowser.actions().mouseMove(secondShowWhiteboardBtn).perform();
        secondShowWhiteboardBtn.click();
      }
      secondBrowser.wait(function () {
        return secondBrowser.element(by.css('ot-whiteboard')) && secondBrowser.element(by.css('ot-whiteboard')).isPresent();
      }, 5000);
      var secondBrowserCanvas = secondBrowser.element(by.css('ot-whiteboard canvas'));
      // Check that the initial data of the second browser is the same as the first
      getWhiteboardData(secondBrowser).then(function(data) {
        expect(data).toEqual(initialData);
      }).then(function() {
        // Draw in the second browser
        secondBrowser.actions().mouseMove(secondBrowserCanvas).mouseDown()
           .mouseMove({x: 0, y:100}).mouseUp().perform();
        return getWhiteboardData(secondBrowser);
      }).then(function(data) {
        firstDrawData = data;
        expect(firstDrawData).not.toEqual(initialData);
        // Wait for the changes to show up on the first browser
        return browser.wait(function() {
          return getWhiteboardData(browser).then(function(data) {
            return data === firstDrawData;
          });
        });
      }).then(function() {
        // Draw on the first browser
        browser.actions().mouseMove(firstBrowserCanvas).mouseDown()
           .mouseMove({x: 100, y:100}).mouseUp().perform();

        return getWhiteboardData(browser);
      }).then(function(data) {
        secondDrawData = data;
        expect(secondDrawData).not.toEqual(firstDrawData);
        // Wait for the changes to show up on the second browser
        return browser.wait(function() {
          return getWhiteboardData(secondBrowser).then(function(data) {
            return data === secondDrawData;
          });
        });
      }).then(function() {
        thirdBrowser = browser.forkNewDriverInstance(true);
        // Wait for flashing red dot indicator in the third browser
        if (showButton) {
          thirdBrowser.wait(function () {
            return thirdBrowser.element(by.css('body.mouse-move .unread-indicator.unread #showWhiteboardBtn'))
              .isPresent();
          }, 30000);
        }
        browser.wait(function () {
          return thirdBrowser.element(by.css('ot-whiteboard')) && thirdBrowser.element(by.css('ot-whiteboard')).isPresent();
        }, 5000);

        return thirdBrowser.wait(function() {
          return getWhiteboardData(thirdBrowser).then(function(data) {
            return data === secondDrawData;
          });
        });
      });
    };
  };

  describe('in the room', function() {
    beforeEach(function () {
      browser.get(roomURL);
    });
    it('drawing works', whiteboardTests(true));
  });

  describe('standalone', function() {
    beforeEach(function () {
      browser.get(roomURL + '/whiteboard');
    });
    it('drawing works', whiteboardTests(false));
  });
});
