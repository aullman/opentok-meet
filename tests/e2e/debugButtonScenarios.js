/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
var uuid = require('uuid');
describe('Debug button', function() {
  var roomName, roomURL;
  beforeEach(function() {
    while(!roomName || roomName.indexOf('p2p') > -1) {
      // Don't want the roomname to have p2p in it or it will be a p2p room
      roomName = uuid.v1();
    }
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
