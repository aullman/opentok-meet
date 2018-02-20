/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
const uuid = require('uuid');

if (browser.params.testScreenSharing) {
  describe('Screen', () => {
    let roomName;
    let roomURL;
    beforeEach(() => {
      while (!roomName || roomName.indexOf('p2p') > -1) {
        // Don't want the roomname to have p2p in it or it will be a p2p room
        roomName = uuid.v1();
      }
      browser.getCapabilities().then((cap) => {
        browser.browserName = cap.get('browserName');
        roomURL = `/${roomName}`;
        browser.get(`${roomName}/screen`);
      });
    });

    afterEach(() => {
      roomName = null;
      roomURL = null;
    });

    describe('screenshare button', () => {
      const screenShareBtn = element(by.css('#showscreen'));

      beforeEach(() => {
        browser.wait(() => screenShareBtn.isDisplayed(), 10000);
      });

      it('exists and is green', () => {
        expect(screenShareBtn.isPresent()).toBe(true);
        expect(screenShareBtn.getAttribute('class')).toContain('green');
      });

      describe('has been clicked', () => {
        beforeEach(() => {
          screenShareBtn.click();
        });
        it('shares the screen', () => {
          expect(screenShareBtn.getAttribute('class')).toContain('red');
          const screenPublisher = element(by.css('#screenPublisher'));
          browser.wait(() => screenPublisher.isPresent(), 10000);
        });
        describe('a subscriber', () => {
          let secondBrowser;
          beforeEach(() => {
            secondBrowser = browser.forkNewDriverInstance(false);
            secondBrowser.get(roomURL);
          });
          afterEach(() => {
            secondBrowser.quit();
          });
          it('subscribes to the screen and it is big', () => {
            const subscriberVideo = secondBrowser.element(by.css(
              'ot-subscriber.OT_big:not(.OT_loading) video'));
            secondBrowser.wait(() => subscriberVideo.isPresent(), 10000);
          });
        });
      });
      it('shows an install prompt when you click it and the extension is not installed',
          (done) => {
            if (browser.browserName === 'chrome') {
              browser.driver.executeScript('OT.registerScreenSharingExtension(\'chrome\', \'foo\');')
              .then(() => {
                expect(element(by.css('#installScreenshareExtension')).isPresent()).toBe(false);
                expect(screenShareBtn.getAttribute('class')).toContain('green');
                screenShareBtn.click();
                expect(screenShareBtn.getAttribute('disabled')).toBe('true');
                browser.wait(() => element(by.css('#installScreenshareExtension')).isPresent(), 10000);
                done();
              });
            } else {
              done();
            }
          });
    });
  });
}
