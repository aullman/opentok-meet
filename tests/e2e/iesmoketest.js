/* global browser: false */
/* global element: false */
/* global by: false */
// This is a smoke test for IE that will run consistently on saucelabs
// the other tests don't pass consistently there
var uuid = require('uuid');
describe('IE Smoke Test', function() {
  it('has the plugin installed and audio, video input devices', function (done) {
    // We need to wait a little bit for the tests before starting. This is to allow
    // the Plugin installer to finish in IE.
    var videoInput = element(by.css('.videoInput'));
    var audioInput = element(by.css('.audioInput'));
    var waitToStart = function () {
      browser.get('/test/devices.html');
      browser.wait(function () {
        return element(by.css('body.loaded')).isPresent();
      }, 4000).then(function () {
        videoInput.isPresent().then(function (hasVideoInput) {
          if (hasVideoInput) {
            audioInput.isPresent().then(function (hasAudioInput) {
              if (hasAudioInput) {
                done();
              } else {
                setTimeout(waitToStart, 2000);
              }
            });
          } else {
            setTimeout(waitToStart, 2000);
          }
        });
      });
    };
    waitToStart();
  });

  it('can connect, publish and subscribe', function () {
    var roomName = uuid.v1() + 'p2p';
    browser.get(roomName);
    // Wait for publisher to load
    browser.wait(function () {
      return element(by.css('.OT_publisher:not(.OT_loading)')).isPresent();
    }, 20000);
    // Wait to connect to session
    browser.wait(function () {
      return element(by.css('div.session-connected')).isPresent();
    }, 10000);
    // Bottom bar buttons are shown
    expect(element(by.css('#publishBtn')).isPresent()).toBe(true);
    expect(element(by.css('#showWhiteboardBtn')).isPresent()).toBe(true);
    expect(element(by.css('#showEditorBtn')).isPresent()).toBe(true);
    // expect(element(by.css('#startArchiveBtn')).isPresent()).toBe(true);
    // Open a new window
    browser.driver.executeScript('window.open("' + browser.baseUrl + roomName + '");');
    // Wait for subscriber to show up
    browser.wait(function () {
      return element(by.css('ot-subscriber')).isPresent();
    }, 20000);
    // Verify connection count
    var connCount = element(by.css('#connCount'));
    expect(connCount.getInnerHtml()).toContain('2');
    // Wait for Subscriber to load
    browser.wait(function () {
      return element(by.css('ot-subscriber')).getAttribute('class').then(function (className) {
        return className.indexOf('.OT_loading') < 0;
      });
    }, 10000);
  });
});
