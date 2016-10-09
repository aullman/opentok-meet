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
