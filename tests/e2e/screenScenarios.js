/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
var uuid = require('uuid');
if (browser.params.testScreenSharing) {
  describe('Screen', function () {
    var roomName, roomURL;
    beforeEach(function () {
      while(!roomName || roomName.indexOf('p2p') > -1) {
        // Don't want the roomname to have p2p in it or it will be a p2p room
        roomName = uuid.v1();
      }
      browser.getCapabilities().then(function (cap) {
        browser.browserName = cap.get('browserName');
        roomURL = roomName;
        roomURL = '/' + roomURL;
        browser.get(roomName + '/screen');
      });
    });

    afterEach(function () {
      roomName = roomURL = null;
    });

    describe('screenshare button', function () {
      var screenShareBtn = element(by.css('#showscreen'));

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
