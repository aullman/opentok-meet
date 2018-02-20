/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
const uuid = require('uuid');

xdescribe('H264', () => {
  let roomName;
  beforeEach(() => {
    while (!roomName || roomName.indexOf('p2p') > -1) {
      // Don't want the roomname to have p2p in it or it will be a p2p room
      roomName = uuid.v1();
    }
    browser.getCapabilities().then((cap) => {
      browser.browserName = cap.get('browserName');
    });
  });

  describe('h264 and dtx checkbox in login screen', () => {
    let h264;
    let dtx;
    let roomField;
    let submit;

    beforeEach(() => {
      browser.get('');
      element(by.css('#advancedLink a')).click();
      roomField = element(by.model('room'));
      submit = element(by.css('#joinRoomBtn'));
      h264 = element(by.model('h264'));
      dtx = element(by.model('dtx'));
    });

    it('should add the h264 parameter on the end of the url', () => {
      roomField.sendKeys(roomName);
      h264.click();
      submit.click();
      expect(browser.getCurrentUrl()).toBe(`${browser.baseUrl + roomName}?h264=true`);
    });

    it('should add the dtx parameter on the end of the url', () => {
      roomField.sendKeys(roomName);
      dtx.click();
      submit.click();
      expect(browser.getCurrentUrl()).toBe(`${browser.baseUrl + roomName}?dtx=true`);
    });

    it('should add the dtx and h264 parameters when both are selected', () => {
      roomField.sendKeys(roomName);
      dtx.click();
      h264.click();
      submit.click();
      expect(browser.getCurrentUrl()).toBe(`${browser.baseUrl + roomName}?h264=true&dtx=true`);
    });
  });

  describe('with 2 participants', () => {
    let secondBrowser;
    beforeEach(() => {
      browser.get(`/${roomName}p2p?h264=true`);
      secondBrowser = browser.forkNewDriverInstance(true);
      secondBrowser.browserName = browser.browserName;
    });

    it('connects and subscribes successfully using H264 codec', () => {
      browser.wait(() => element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element')).isPresent(), 20000);
      secondBrowser.wait(() => secondBrowser.element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element'))
        .isPresent(), 20000);

      if (browser.browserName !== 'chrome') {
        // getting videoCodec from stats only works in Chrome right now
        return;
      }
      const secondSubscriber = secondBrowser.element(by.css('ot-subscriber'));
      secondBrowser.actions().mouseDown(secondSubscriber).mouseUp().perform();
      const showStatsInfo = secondSubscriber.element(by.css('.show-stats-info'));
      const statsButton = secondSubscriber.element(by.css('.show-stats-btn'));
      statsButton.click();
      secondBrowser.wait(() => showStatsInfo.isDisplayed(), 2000);
      expect(showStatsInfo.isDisplayed()).toBe(true);
      secondBrowser.wait(() => showStatsInfo.getInnerHtml().then((innerHTML) => {
        const statsRegexp = new RegExp('Video Codec: H264 <br>', 'gi');
        return statsRegexp.test(innerHTML);
      }), 30000);  // Wait 30 seconds because that's how long QOS takes
    });
  });
});
