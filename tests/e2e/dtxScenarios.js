/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
const uuid = require('uuid');

xdescribe('dtx', () => {
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

  describe('dtx checkbox in login screen', () => {
    let dtx;
    let roomField;
    let submit;

    beforeEach(() => {
      browser.get('');
      element(by.css('#advancedLink a')).click();
      roomField = element(by.model('room'));
      submit = element(by.css('#joinRoomBtn'));
      dtx = element(by.model('dtx'));
    });

    it('should add the dtx parameter on the end of the url', () => {
      roomField.sendKeys(roomName);
      dtx.click();
      submit.click();
      expect(browser.getCurrentUrl()).toBe(`${browser.baseUrl + roomName}?dtx=true`);
    });
  });
});
