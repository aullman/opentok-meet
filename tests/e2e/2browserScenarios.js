/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
var uuid = require('uuid');
describe('2 browsers in the same room', function() {
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
      secondBrowser = browser.forkNewDriverInstance(true);
      secondBrowser.browserName = browser.browserName;
    });
  });

  afterEach(function () {
    roomName = roomURL = null;
    if (secondBrowser) {
      secondBrowser.quit();
    }
  });

  describe('subscribing to one another', function () {
    beforeEach(function () {
      browser.wait(function () {
        return element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element')).isPresent();
      }, 20000);
      secondBrowser.wait(function () {
        return secondBrowser.element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element')).isPresent();
      }, 20000);
    });

    xit('should display a video element with the right videoWidth and videoHeight', function () {
      var checkVideo = function(browser) {
        var subscriberVideo =
          browser.element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element'));
        if (browser.browserName === 'chrome') {
          // With Simulcast your not sure what the dimensions are, but they should be the
          // right aspect ratio.
          expect(subscriberVideo.getAttribute('videoWidth').then(function (videoWidth) {
            return subscriberVideo.getAttribute('videoHeight').then(function (videoHeight) {
              return parseInt(videoWidth, 10) / parseInt(videoHeight, 10);
            });
          })).toEqual(1280/720);
        } else {
          expect(subscriberVideo.getAttribute('videoWidth')).toBe('640');
          expect(subscriberVideo.getAttribute('videoHeight')).toBe('480');
        }
      };
      checkVideo(browser);
      checkVideo(secondBrowser);
    });

    it('subscribers should change size when you double-click', function () {
      var subscriber = secondBrowser.element(by.css('ot-subscriber'));
      expect(subscriber.getAttribute('class')).not.toContain('OT_big');
      secondBrowser.actions().doubleClick(subscriber).perform();
      expect(subscriber.getAttribute('class')).toContain('OT_big');
      secondBrowser.actions().doubleClick(subscriber).perform();
      expect(subscriber.getAttribute('class')).not.toContain('OT_big');
    });

    describe('subscriber buttons', function () {
      var secondSubscriber;
      beforeEach(function (done) {
        secondSubscriber = secondBrowser.element(by.css('ot-subscriber'));
        // Move the publisher out of the way
        secondBrowser.driver.executeScript('$(\'#facePublisher\').css({top:200, left:0});')
          .then(function () {
          secondBrowser.actions().mouseDown(secondSubscriber).mouseUp().perform();
          // Have to wait for the buttons to show up
          secondBrowser.sleep(1000).then(function () {
            done();
          });
        });
      });

      it('change size button works', function () {
        expect(secondSubscriber.getAttribute('class')).not.toContain('OT_big');
        var resizeBtn = secondSubscriber.element(by.css('.resize-btn'));
        expect(resizeBtn.getAttribute('title')).toBe('Enlarge');
        resizeBtn.click();
        secondBrowser.wait(function () {
          return secondSubscriber.getAttribute('class').then(function (className) {
            return className.indexOf('OT_big') > -1;
          });
        }, 5000);
        expect(resizeBtn.getAttribute('title')).toBe('Shrink');
        secondBrowser.actions().mouseDown(secondSubscriber).mouseUp().perform();
        resizeBtn.click();
        secondBrowser.wait(function () {
          return secondSubscriber.getAttribute('class').then(function (className) {
            return className.indexOf('OT_big') === -1;
          });
        }, 5000);
        expect(resizeBtn.getAttribute('title')).toBe('Enlarge');
      });

      it('muteVideo button works', function () {
        var muteBtn = secondSubscriber.element(by.css('mute-video'));
        expect(muteBtn.element(by.css('.ion-ios7-close')).isPresent()).toBe(true);
        muteBtn.click();
        expect(secondSubscriber.getAttribute('class')).toContain('OT_audio-only');
        expect(muteBtn.element(by.css('.ion-ios7-checkmark')).isPresent()).toBe(true);
        muteBtn.click();
        expect(muteBtn.element(by.css('.ion-ios7-close')).isPresent()).toBe(true);
        expect(secondSubscriber.getAttribute('class')).not.toContain('OT_audio-only');
      });

      it('restrictFramerate button toggles the icon and fps text', function () {
        var restrictFramerateBtn = secondSubscriber.element(by.css('.restrict-framerate-btn'));
        var restrictFramerateIcon = restrictFramerateBtn.element(by.css('.restrict-framerate-btn-icon'));

        function testRestrictFramerateBtn(options) {
          if (!options.noClick) {
            restrictFramerateBtn.click();
          }
          var restrictFramerateText = restrictFramerateBtn.element(by.css('.restrict-framerate-btn-text'));
          expect(restrictFramerateText.isPresent()).toBe(options.text !== undefined);
          if (options.text) {
            expect(restrictFramerateText.getText()).toEqual(options.text);
          }
          expect(restrictFramerateIcon.getAttribute('class')).toContain(options.iconClass);
        }

        [
          { text: undefined, iconClass: 'ion-ios7-speedometer', noClick: true},
          { text: '15fps', iconClass: 'ion-ios7-speedometer-outline'},
          { text: '7fps', iconClass: 'ion-ios7-speedometer-outline'},
          { text: '1fps', iconClass: 'ion-ios7-speedometer-outline'},
          { text: undefined, iconClass: 'ion-ios7-speedometer'}
        ].forEach(testRestrictFramerateBtn);
      });

      it('stats button works', function() {
        var showStatsInfo = secondSubscriber.element(by.css('.show-stats-info'));
        var statsButton = secondSubscriber.element(by.css('.show-stats-btn'));
        expect(showStatsInfo.isDisplayed()).toBe(false);
        statsButton.click();
        secondBrowser.wait(function() {
          return showStatsInfo.isDisplayed();
        }, 2000);
        expect(showStatsInfo.isDisplayed()).toBe(true);
        secondBrowser.wait(function() {
          return showStatsInfo.getInnerHtml().then(function(innerHTML) {
            var statsRegexp = new RegExp('Resolution: \\d+x\\d+<br>.*' +
              'Audio Packet Loss: \\d\\d?\\.\\d\\d%<br>' +
              'Audio Bitrate: \\d+ kbps<br>.*' +
              'Video Packet Loss: \\d\\d?\\.\\d\\d%<br>' +
              'Video Bitrate: \\d+ kbps<br>' +
              'Frame Rate: \\d+(\\.\\d+)? fps.*' +
              'Origin server:[\\w.-\\s]+<br>' +
              'Edge server:[\\w.-\\s]+', 'gi');
            return statsRegexp.test(innerHTML);
          });
        }, 5000);
      });
    });

    if (browser.params.testScreenSharing) {
      describe('sharing the screen', function () {
        beforeEach(function () {
          var showScreenBtn = secondBrowser.element(by.css('#showscreen'));
          secondBrowser.actions().mouseMove(showScreenBtn).perform();
          showScreenBtn.click();
        });
        it('subscribes to the screen and it is big', function () {
          var subscriberVideo = element(by.css(
            'ot-subscriber.OT_big:not(.OT_loading) video'));
          browser.wait(function () {
            return subscriberVideo.isPresent();
          }, 10000);
        });
      });
    }

    describe('disconnecting', function () {
      var connCount, firstSubscriber;
      beforeEach(function () {
        firstSubscriber = element(by.css('ot-subscriber'));
        connCount = element(by.css('#connCount'));
        expect(firstSubscriber.isPresent()).toBe(true);
        expect(connCount.getInnerHtml()).toContain('2');
      });

      afterEach(function () {
        // Wait 5 seconds for the connection count to go down to 1
        browser.wait(function () {
          return connCount.getInnerHtml().then(function (innerHTML) {
            return innerHTML.trim() === '1';
          });
        }, 5000);
        // Wait 5 seconds for the Subscriber to go away
        browser.wait(function () {
          return firstSubscriber.isPresent().then(function (present) {
            return !present;
          });
        }, 5000);
      });

      it('with change room button', function () {
        // Disconnect the second browser
        secondBrowser.element(by.css('#changeRoom')).click();
      });

      it('by closing the browser window', function () {
        secondBrowser.quit();
        secondBrowser = null;
      });
    });
  });
});

describe('Phone', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
    browser.get(roomName + '/phone');
  });
  it('has the right phone number on the page', function () {
    expect(element(by.css('p')).getInnerHtml()).toContain('Call ' + browser.params.phoneNumber);
  });
});

describe('Debug button', function() {
  beforeEach(function() {
    browser.get(roomURL);
    browser.wait(function () {
      return element(by.css('div.session-connected')).isPresent();
    }, 10000);
  });
  it('Opens a new window', function() {
    element(by.css('.ion-bug')).click();
    browser.getAllWindowHandles().then(function (handles) {
      expect(handles.length).toBe(2);
      // I tried to check that the mailto link is there but getCurrentUrl was timing out
    });
  });
});

if (browser.params.testScreenSharing) {
  describe('Screen', function () {
    beforeEach(function () {
      browser.get(roomName + '/screen');
    });

    describe('screenshare button', function () {
      var screenShareBtn = element(by.css('#showscreen'));

      beforeEach(function () {
        browser.wait(function () {
          return screenShareBtn.isDisplayed();
        }, 10000);
      });

      it('exists and is green', function () {
        expect(screenShareBtn.isPresent()).toBe(true);
        expect(screenShareBtn.getAttribute('class')).toContain('green');
      });

      describe('has been clicked', function () {
        beforeEach(function () {
          screenShareBtn.click();
        });
        it('shares the screen', function () {
          expect(screenShareBtn.getAttribute('class')).toContain('red');
          var screenPublisher = element(by.css('#screenPublisher'));
          browser.wait(function () {
            return screenPublisher.isPresent();
          }, 10000);
        });
        describe('a subscriber', function () {
          var secondBrowser;
          beforeEach(function () {
            secondBrowser = browser.forkNewDriverInstance(false);
            secondBrowser.get(roomURL);
          });
          afterEach(function() {
            secondBrowser.quit();
          });
          it('subscribes to the screen and it is big', function () {
            var subscriberVideo = secondBrowser.element(by.css(
              'ot-subscriber.OT_big:not(.OT_loading) video'));
            secondBrowser.wait(function () {
              return subscriberVideo.isPresent();
            }, 10000);
          });
        });
      });
      it('shows an install prompt when you click it and the extension is not installed',
          function (done) {
        if (browser.browserName === 'chrome') {
          browser.driver.executeScript('OT.registerScreenSharingExtension(\'chrome\', \'foo\');')
              .then(function () {
            expect(element(by.css('#installScreenshareExtension')).isPresent()).toBe(false);
            expect(screenShareBtn.getAttribute('class')).toContain('green');
            screenShareBtn.click();
            expect(screenShareBtn.getAttribute('disabled')).toBe('true');
            browser.wait(function () {
              return element(by.css('#installScreenshareExtension')).isPresent();
            }, 10000);
            done();
          });
        } else {
          done();
        }
      });
    });
  });
}
