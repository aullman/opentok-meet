/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
const uuid = require('uuid');

describe('2 browsers in the same room', () => {
  let roomName;
  let roomURL;
  let secondBrowser;
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
      secondBrowser = browser.forkNewDriverInstance(true);
      secondBrowser.browserName = browser.browserName;
    });
  });

  afterEach(() => {
    roomName = null;
    roomURL = null;
    if (secondBrowser) {
      secondBrowser.quit();
    }
  });

  describe('subscribing to one another', () => {
    beforeEach(() => {
      browser.wait(() => element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element')).isPresent(), 20000);
      secondBrowser.wait(() => secondBrowser.element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element'))
        .isPresent(), 20000);
    });

    xit('should display a video element with the right videoWidth and videoHeight', () => {
      const checkVideo = (browser) => {
        const subscriberVideo =
          browser.element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element'));
        if (browser.browserName === 'chrome') {
          // With Simulcast your not sure what the dimensions are, but they should be the
          // right aspect ratio.
          expect(subscriberVideo.getAttribute('videoWidth').then(videoWidth => subscriberVideo.getAttribute('videoHeight').then(videoHeight => parseInt(videoWidth, 10) / parseInt(videoHeight, 10)))).toEqual(1280 / 720);
        } else {
          expect(subscriberVideo.getAttribute('videoWidth')).toBe('640');
          expect(subscriberVideo.getAttribute('videoHeight')).toBe('480');
        }
      };
      checkVideo(browser);
      checkVideo(secondBrowser);
    });

    it('subscribers should change size when you double-click', () => {
      const subscriber = secondBrowser.element(by.css('ot-subscriber'));
      expect(subscriber.getAttribute('class')).not.toContain('OT_big');
      secondBrowser.actions().doubleClick(subscriber).perform();
      expect(subscriber.getAttribute('class')).toContain('OT_big');
      secondBrowser.actions().doubleClick(subscriber).perform();
      expect(subscriber.getAttribute('class')).not.toContain('OT_big');
    });

    describe('subscriber buttons', () => {
      let secondSubscriber;
      beforeEach((done) => {
        secondSubscriber = secondBrowser.element(by.css('ot-subscriber'));
        // Move the publisher out of the way
        secondBrowser.driver.executeScript('$(\'#facePublisher\').css({top:200, left:0});')
          .then(() => {
            secondBrowser.actions().mouseDown(secondSubscriber).mouseUp().perform();
            // Have to wait for the buttons to show up
            secondBrowser.sleep(1000).then(() => {
              done();
            });
          });
      });

      it('zoom button should work', () => {
        const subscriber = secondBrowser.element(by.css('ot-subscriber'));

        const checkZoomed = (zoomed) => {
          // Check whether the aspect ratio matches the videoWidth and videoHeight
          if (browser.browserName === 'chrome') {
            // We set the browser dimensions in Chrome but not other browsers so zooming
            // doesn't work there
            secondBrowser.wait(() => subscriber.getSize().then((size) => {
              if (zoomed) {
                return size.width / size.height !== 1280 / 720;
              }
              return size.width / size.height === 1280 / 720;
            }));
          }
        };
        const zoomBtn = secondBrowser.element(by.css('button.zoom-btn'));
        checkZoomed(true);
        zoomBtn.click();
        checkZoomed(false);
        secondBrowser.actions().mouseDown(secondSubscriber).mouseUp().perform();
        zoomBtn.click();
        checkZoomed(true);
      });

      it('change size button works', () => {
        expect(secondSubscriber.getAttribute('class')).not.toContain('OT_big');
        const resizeBtn = secondSubscriber.element(by.css('.resize-btn'));
        expect(resizeBtn.getAttribute('title')).toBe('Enlarge');
        resizeBtn.click();
        secondBrowser.wait(() => secondSubscriber.getAttribute('class').then(className => className.indexOf('OT_big') > -1), 5000);
        expect(resizeBtn.getAttribute('title')).toBe('Shrink');
        secondBrowser.actions().mouseDown(secondSubscriber).mouseUp().perform();
        resizeBtn.click();
        secondBrowser.wait(() => secondSubscriber.getAttribute('class').then(className => className.indexOf('OT_big') === -1), 5000);
        expect(resizeBtn.getAttribute('title')).toBe('Enlarge');
      });

      it('muteVideo button works', () => {
        const muteBtn = secondSubscriber.element(by.css('mute-video'));
        expect(muteBtn.element(by.css('.ion-ios7-close')).isPresent()).toBe(true);
        muteBtn.click();
        expect(secondSubscriber.getAttribute('class')).toContain('OT_audio-only');
        expect(muteBtn.element(by.css('.ion-ios7-checkmark')).isPresent()).toBe(true);
        muteBtn.click();
        expect(muteBtn.element(by.css('.ion-ios7-close')).isPresent()).toBe(true);
        expect(secondSubscriber.getAttribute('class')).not.toContain('OT_audio-only');
      });

      it('restrictFramerate button toggles the icon and fps text', () => {
        const restrictFramerateBtn = secondSubscriber.element(by.css('.restrict-framerate-btn'));
        const restrictFramerateIcon =
          restrictFramerateBtn.element(by.css('.restrict-framerate-btn-icon'));

        function testRestrictFramerateBtn(options) {
          if (!options.noClick) {
            restrictFramerateBtn.click();
          }
          const restrictFramerateText =
            restrictFramerateBtn.element(by.css('.restrict-framerate-btn-text'));
          expect(restrictFramerateText.isPresent()).toBe(options.text !== undefined);
          if (options.text) {
            expect(restrictFramerateText.getText()).toEqual(options.text);
          }
          expect(restrictFramerateIcon.getAttribute('class')).toContain(options.iconClass);
        }

        [
          { text: undefined, iconClass: 'ion-ios7-speedometer', noClick: true },
          { text: '15fps', iconClass: 'ion-ios7-speedometer-outline' },
          { text: '7fps', iconClass: 'ion-ios7-speedometer-outline' },
          { text: '1fps', iconClass: 'ion-ios7-speedometer-outline' },
          { text: undefined, iconClass: 'ion-ios7-speedometer' },
        ].forEach(testRestrictFramerateBtn);
      });

      it('stats button works', () => {
        const showStatsInfo = secondSubscriber.element(by.css('ot-subscriber .show-stats-info'));
        const statsButton = secondSubscriber.element(by.css('ot-subscriber .show-stats-btn'));
        expect(showStatsInfo.isDisplayed()).toBe(false);
        statsButton.click();
        secondBrowser.wait(() => showStatsInfo.isDisplayed(), 2000);

        expect(showStatsInfo.isDisplayed()).toBe(true);

        const resolutionRegex = /^\d+x\d+$/;
        const packetLossRegex = /^(\d{1,3}[.,])+\d{2}%$/;
        const bitrateRegex = /^(\d{1,3}[.,])+\d{2} kbps$/;
        const framerateRegex = /^(\d{1,3}[.,])+\d{2} fps$/;
        const serverRegex = /^[\w.-]+\.tokbox\.com$/;

        expect(secondBrowser.element(by.css('[data-for="resolution"]')).getText()).toMatch(resolutionRegex);
        expect(secondBrowser.element(by.css('[data-for="audioPacketLoss"]')).getText()).toMatch(packetLossRegex);
        expect(secondBrowser.element(by.css('[data-for="audioBitrate"]')).getText()).toMatch(bitrateRegex);
        expect(secondBrowser.element(by.css('[data-for="videoPacketLoss"]')).getText()).toMatch(packetLossRegex);
        expect(secondBrowser.element(by.css('[data-for="videoBitrate"]')).getText()).toMatch(bitrateRegex);
        expect(secondBrowser.element(by.css('[data-for="videoFramerate"]')).getText()).toMatch(framerateRegex);
        expect(secondBrowser.element(by.css('[data-for="originServer"]')).getText()).toMatch(serverRegex);
        expect(secondBrowser.element(by.css('[data-for="edgeServer"]')).getText()).toMatch(serverRegex);
      });

      it('report button works', () => {
        const showReportInfo = secondSubscriber.element(by.css('.show-report-info'));
        const reportButton = secondSubscriber.element(by.css('.show-report-btn'));
        expect(showReportInfo.isDisplayed()).toBe(false);
        reportButton.click();
        secondBrowser.wait(() => showReportInfo.isDisplayed(), 2000);
        expect(showReportInfo.isDisplayed()).toBe(true);
      });
    });

    if (browser.params.testScreenSharing) {
      describe('sharing the screen', () => {
        beforeEach(() => {
          const showScreenBtn = secondBrowser.element(by.css('#showscreen'));
          secondBrowser.actions().mouseMove(showScreenBtn).perform();
          showScreenBtn.click();
        });
        // This has started failing for some reason in Firefox
        xit('subscribes to the screen and it is big', () => {
          const subscriberVideo = element(by.css('ot-subscriber.OT_big:not(.OT_loading) video'));
          browser.wait(() => subscriberVideo.isPresent(), 10000);
        });
      });
    }

    describe('disconnecting', () => {
      let connCount;
      let firstSubscriber;
      beforeEach(() => {
        firstSubscriber = element(by.css('ot-subscriber'));
        connCount = element(by.css('#connCount'));
        expect(firstSubscriber.isPresent()).toBe(true);
        expect(connCount.getInnerHtml()).toContain('2');
      });

      afterEach(() => {
        // Wait 5 seconds for the connection count to go down to 1
        browser.wait(() => connCount.getInnerHtml().then(innerHTML => innerHTML.trim() === '1'), 5000);
        // Wait 5 seconds for the Subscriber to go away
        browser.wait(() => firstSubscriber.isPresent().then(present => !present), 5000);
      });

      it('with change room button', () => {
        // Disconnect the second browser
        secondBrowser.element(by.css('#changeRoom')).click();
      });

      it('by closing the browser window', () => {
        secondBrowser.quit();
        secondBrowser = null;
      });
    });
  });
});
