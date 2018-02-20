/* global browser: false */
/* global element: false */
/* global by: false */
// This is a smoke test for IE that will run consistently on saucelabs
// the other tests don't pass consistently there
const uuid = require('uuid');

describe('IE Smoke Test', () => {
  it('can connect, publish and subscribe', () => {
    const roomName = `${uuid.v1()}p2p`;
    browser.get(roomName);
    // Wait for publisher to load
    browser.wait(() => element(by.css('.OT_publisher:not(.OT_loading)')).isPresent(), 20000);
    // Wait to connect to session
    browser.wait(() => element(by.css('div.session-connected')).isPresent(), 10000);
    // Bottom bar buttons are shown
    expect(element(by.css('#publishBtn')).isPresent()).toBe(true);
    expect(element(by.css('#showWhiteboardBtn')).isPresent()).toBe(true);
    expect(element(by.css('#showEditorBtn')).isPresent()).toBe(true);
    // expect(element(by.css('#startArchiveBtn')).isPresent()).toBe(true);
    // Open a new window
    browser.driver.executeScript(`window.open("${browser.baseUrl}${roomName}");`);
    // Wait for subscriber to show up
    browser.wait(() => element(by.css('ot-subscriber')).isPresent(), 20000);
    // Verify connection count
    const connCount = element(by.css('#connCount'));
    expect(connCount.getInnerHtml()).toContain('2');
    // Wait for Subscriber to load
    browser.wait(() => element(by.css('ot-subscriber')).getAttribute('class').then(className => className.indexOf('.OT_loading') < 0), 10000);
  });
});
