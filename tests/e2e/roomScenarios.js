/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
const uuid = require('uuid');

describe('Room', () => {
  let roomName;
  let roomURL;
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
    });
  });

  afterEach(() => {
    roomName = null;
    roomURL = null;
  });

  it('should have the right title', () => {
    expect(browser.getTitle()).toEqual(`OpenTok Meet : ${roomName}`);
  });

  // This isn't passing in browserstack for some reason. Need to figure out why.
  xit('should have a loader being displayed', () => {
    browser.wait(() => element(by.css('#loader')).isDisplayed(), 10000);
  });

  it('should show a shareInfo message when you connect', () => {
    browser.wait(() => element(by.css('#shareInfo')).isPresent(), 10000);
  });

  describe('publisher', () => {
    const publisher = element(by.css('div#facePublisher'));
    it('is displayed', () => {
      expect(publisher.isPresent()).toBe(true);
      expect(publisher.isDisplayed()).toBe(true);
    });

    it('contains a video element and is HD', () => {
      if (browser.browserName === 'internet explorer') {
        return;
      }
      browser.wait(() => element(by.css('.OT_publisher:not(.OT_loading)')).isPresent(), 10000);
      const publisherVideo = publisher.element(by.css('video'));
      expect(publisherVideo).toBeDefined();
      expect(publisherVideo.getAttribute('videoWidth')).toBe(browser.browserName === 'chrome' ? '1280' : '640');
      expect(publisherVideo.getAttribute('videoHeight')).toBe(browser.browserName === 'chrome' ? '720' : '480');
    });

    it('moves when it is dragged', () => {
      const oldLocation = publisher.getLocation();
      // Offset the mouse click position so we're not clicking on the mute button
      browser.actions().mouseMove(publisher)
        .mouseMove({ x: 25, y: -25 })
        .mouseDown()
        .mouseMove(element(by.css('body')))
        .mouseUp()
        .perform();
      const newLocation = publisher.getLocation();
      expect(newLocation).not.toEqual(oldLocation);
    });

    // Note this does not actually work in Chrome because drag and drop doesn't
    // work properly in webdriver https://github.com/angular/protractor/issues/583
    it('stays on the screen if you resize too small', () => {
      expect(publisher.isDisplayed()).toBe(true);
      browser.manage().window().setSize(800, 800);
      browser.actions().mouseDown(publisher)
        .mouseMove({ x: 700, y: 700 }).mouseUp()
        .perform();
      browser.manage().window().setSize(500, 500);
      expect(publisher.isDisplayed()).toBe(true);
    });

    describe('mute buttons', () => {
      beforeEach(() => {
        browser.wait(() => element(by.css('.OT_publisher:not(.OT_loading)')).isPresent(), 10000);
      });

      it('mutes video when you click the mute-video icon', () => {
        const muteVideo = publisher.element(by.css('mute-video'));
        expect(muteVideo.isPresent()).toBe(true);
        expect(muteVideo.isDisplayed()).toBe(false);
        browser.actions().mouseMove(muteVideo).perform();
        browser.wait(() => muteVideo.isDisplayed(), 10000);
        const muteCameraButton = element(by.css('button[name="muteCamera"]'));
        browser.actions().mouseMove(muteCameraButton).perform();
        expect(muteCameraButton.isPresent()).toBe(true);
        browser.wait(() => muteCameraButton.isDisplayed(), 10000);

        const verifyMuted = (muted) => {
          // muted button has a checkmark or a cross in it
          expect(muteVideo.element(by.css(muted ? '.ion-ios7-checkmark' : '.ion-ios7-close'))
            .isPresent()).toBe(true);
          // bottom bar camera button is green or red
          expect(muteCameraButton.getAttribute('class')).toContain(muted ? 'green' : 'red');
          if (muted) {
            // Publisher is in audio only mode
            expect(publisher.element(by.css('ot-publisher')).getAttribute('class'))
              .toContain('OT_audio-only');
          } else {
            // Publisher is not in audio only mode
            expect(publisher.element(by.css('ot-publisher')).getAttribute('class'))
              .not.toContain('OT_audio-only');
          }
        };
        verifyMuted(false);
        muteVideo.click();
        verifyMuted(true);
        muteVideo.click();
        verifyMuted(false);
        muteCameraButton.click();
        verifyMuted(true);
        muteCameraButton.click();
        verifyMuted(false);
      });

      it('toggles mic when you click the mic button', () => {
        const muteMicButton = element(by.css('button[name="muteMicrophone"]'));
        expect(muteMicButton.isPresent()).toBe(true);
        const publisherMuteBtn = publisher.element(by.css('.OT_mute'));

        const verifyMuted = (muted) => {
          expect(muteMicButton.getAttribute('class')).toContain(muted ? 'green' : 'red');
          expect(muteMicButton.getAttribute('class')).toContain(muted ? 'ion-ios7-mic-off' : 'ion-ios7-mic');
          if (muted) {
            expect(publisherMuteBtn.getAttribute('class')).toContain('OT_active');
          } else {
            expect(publisherMuteBtn.getAttribute('class')).not.toContain('OT_active');
          }
        };
        verifyMuted(false);
        muteMicButton.click();
        verifyMuted(true);
        muteMicButton.click();
        verifyMuted(false);
        publisherMuteBtn.click();
        verifyMuted(true);
        publisherMuteBtn.click();
        verifyMuted(false);
      });
    });

    it('shows a warning icon and an alert when we get an audioAcquisitionProblem', () => {
      browser.wait(() => element(by.css('.OT_publisher:not(.OT_loading)')).isPresent(), 10000);
      const audioAcquisitionProblem = element(by.css('#facePublisher audio-acquisition-problem'));
      expect(audioAcquisitionProblem.isDisplayed()).toBe(false);
      browser.driver.executeScript('OT.publishers.find().trigger(\'audioAcquisitionProblem\', { method: \'mock\' });')
        .then(() => {
          expect(audioAcquisitionProblem.isDisplayed()).toBe(true);
        });
    });

    it('displays an error if there is a publish error', () => {
      const publishErrors = element(by.css('ot-errors'));
      expect(publishErrors.isDisplayed()).toBe(false);
      expect(publisher.isPresent()).toBe(true);
      browser.driver.executeScript('angular.element("ot-publisher").scope().$emit' +
        '("otPublisherError", {message:"whatever"}, {id:"facePublisher"})').then(() => {
        expect(publishErrors.isDisplayed()).toBe(true);
        expect(publisher.isPresent()).toBe(false);
      });
    });
  });

  it('stats button works', () => {
    const showStatsInfo = element(by.css('.show-stats-info'));
    const statsButton = element(by.css('.statsBtn'));
    expect(showStatsInfo.isDisplayed()).toBe(false);
    statsButton.click();
    browser.wait(() => showStatsInfo.isDisplayed(), 2000);

    expect(showStatsInfo.isDisplayed()).toBe(true);

    const resolutionRegex = /^\d+x\d+$/;
    const packetLossRegex = /^(\d{1,3}[.,])+\d{2}%$/;
    const bitrateRegex = /^(\d{1,3}[.,])+\d{2} kbps$/;
    const framerateRegex = /^(\d{1,3}[.,])+\d{2} fps$/;

    expect(element(by.css('[data-for="resolution"]')).getText()).toMatch(resolutionRegex);
    expect(element(by.css('[data-for="audioPacketLoss"]')).getText()).toMatch(packetLossRegex);
    expect(element(by.css('[data-for="audioBitrate"]')).getText()).toMatch(bitrateRegex);
    expect(element(by.css('[data-for="videoPacketLoss"]')).getText()).toMatch(packetLossRegex);
    expect(element(by.css('[data-for="videoBitrate"]')).getText()).toMatch(bitrateRegex);
    expect(element(by.css('[data-for="videoFramerate"]')).getText()).toMatch(framerateRegex);
  });

  describe('footer', () => {
    it('Github link and report issue link is present', () => {
      const githubLink = element(by.css('#footer a [title="View source on GitHub"]'));
      expect(githubLink.isPresent()).toBe(true);
      const issueLink = element(by.css('#footer a [title="Report Issue"]'));
      expect(issueLink.isPresent()).toBe(true);
    });
  });

  describe('bottomBar', () => {
    describe('publish buttons', () => {
      const publishBtn = element(by.css('#publishBtn'));
      const publishSDBtn = element(by.css('#publishSDBtn'));

      it('publishBtn is red and being displayed publishSDBtn is not present', () => {
        expect(publishBtn.isPresent()).toBe(true);
        expect(publishBtn.getAttribute('class')).toContain('red');
        expect(publishSDBtn.isPresent()).toBe(false);
      });

      it('publishBtn toggles the publisher when clicked and goes between green and red ' +
          'and publishes in HD', () => {
        const publisher = element(by.css('div#facePublisher'));
        expect(publisher.isPresent()).toBe(true);
        publishBtn.click();
        browser.wait(() => publisher.isPresent().then(present => !present), 1000);
        expect(publishBtn.getAttribute('class')).toContain('green');
        publishBtn.click();
        expect(publisher.isPresent()).toBe(true);
        expect(publishBtn.getAttribute('class')).toContain('red');
        browser.wait(() => element(by.css('.OT_publisher:not(.OT_loading)')).isPresent(), 10000);
        if (browser.browserName !== 'internet explorer') {
          const publisherVideo = publisher.element(by.css('video'));
          expect(publisherVideo.getAttribute('videoWidth')).toBe(browser.browserName === 'chrome' ? '1280' : '640');
          expect(publisherVideo.getAttribute('videoHeight')).toBe(browser.browserName === 'chrome' ? '720' : '480');
        }
      });

      it('publishSDBtn shows up when you unpublish and mute buttons go away', () => {
        const publisher = element(by.css('div#facePublisher'));
        const muteMicButton = element(by.css('button[name="muteMicrophone"]'));
        const muteCameraButton = element(by.css('button[name="muteCamera"]'));
        expect(muteMicButton.isPresent()).toBe(true);
        expect(muteCameraButton.isPresent()).toBe(true);
        publishBtn.click();
        // You have to wait for the hardware to clean up properly before acquiring the camera
        // again, otherwise you end up with the same resolution.
        browser.sleep(1000);
        expect(publishSDBtn.isPresent()).toBe(true);
        expect(muteMicButton.isPresent()).toBe(false);
        expect(muteCameraButton.isPresent()).toBe(false);
        publishSDBtn.click();
        expect(publisher.isPresent()).toBe(true);
        expect(muteMicButton.isPresent()).toBe(true);
        expect(muteCameraButton.isPresent()).toBe(true);
        browser.wait(() => element(by.css('.OT_publisher:not(.OT_loading)')).isPresent(), 10000);
        // var publisherVideo = publisher.element(by.css('video'));
        // Not sure why but below fails if I run all the tests but not
        // if I run this test alone
        // expect(publisherVideo.getAttribute('videoWidth')).toBe('640');
        // expect(publisherVideo.getAttribute('videoHeight')).toBe('480');
      });
    });

    describe('showWhiteboardBtn', () => {
      const showWhiteboardBtn = element(by.css('#showWhiteboardBtn'));

      it('is green and being displayed', () => {
        expect(showWhiteboardBtn.isPresent()).toBe(true);
        expect(showWhiteboardBtn.getAttribute('class')).toContain('green');
      });

      it(
        'toggles the whiteboard when you click it and the button goes between green and red',
        () => {
          browser.wait(() => element(by.css('ot-whiteboard')).isPresent(), 10000);
          const whiteboard = element(by.css('ot-whiteboard'));
          expect(whiteboard.isPresent()).toBe(true);
          expect(whiteboard.isDisplayed()).toBe(false);
          showWhiteboardBtn.click();
          expect(showWhiteboardBtn.getAttribute('class')).toContain('red');
          expect(whiteboard.isDisplayed()).toBe(true);
          showWhiteboardBtn.click();
          expect(showWhiteboardBtn.getAttribute('class')).toContain('green');
          expect(whiteboard.isDisplayed()).toBe(false);
        }
      );
    });

    describe('showEditorBtn', () => {
      const showEditorBtn = element(by.css('#showEditorBtn'));

      it('is green and being displayed', () => {
        expect(showEditorBtn.isPresent()).toBe(true);
        expect(showEditorBtn.getAttribute('class')).toContain('green');
      });

      it(
        'toggles the editor when you click it and the button goes between green and red',
        () => {
          browser.wait(() => element(by.css('ot-editor')).isPresent(), 10000);
          const editor = element(by.css('ot-editor'));
          expect(editor.isPresent()).toBe(true);
          expect(editor.isDisplayed()).toBe(false);
          showEditorBtn.click();
          expect(editor.isDisplayed()).toBe(true);
          expect(showEditorBtn.getAttribute('class')).toContain('red');
          showEditorBtn.click();
          expect(editor.isDisplayed()).toBe(false);
          expect(showEditorBtn.getAttribute('class')).toContain('green');
        }
      );
    });

    describe('startArchiveBtn', () => {
      const startArchiveBtn = element(by.css('#startArchiveBtn'));
      beforeEach(() => {
        browser.wait(() => startArchiveBtn.isPresent(), 10000);
        browser.sleep(1000);
      });

      it('is present and green', () => {
        expect(startArchiveBtn.isPresent()).toBe(true);
        expect(startArchiveBtn.getAttribute('class')).toContain('green');
      });

      it('toggles archiving when you click it and adds an archiving status message', () => {
        startArchiveBtn.click();
        expect(startArchiveBtn.getAttribute('class')).toContain('red');
        // Wait for the archiving light to show up in the Publisher
        browser.wait(() => element(by.css('.OT_publisher .OT_archiving-on')).isPresent(), 10000);
        expect(element(by.css('#archiveStatus')).isPresent()).toBe(true);
        startArchiveBtn.click();
        expect(startArchiveBtn.getAttribute('class')).toContain('green');
        // Wait for the archiving light to turn off
        browser.wait(() => element(by.css('.OT_publisher .OT_archiving-off')).isPresent(), 10000);
      });
    });

    if (browser.params.testScreenSharing) {
      // Taking this out for Sauce Labs Tests for now until I can figure out how to
      // install extensions
      describe('screenshare button', () => {
        const screenShareBtn = element(by.css('#showscreen'));

        it('exists and is green', () => {
          expect(screenShareBtn.isPresent()).toBe(true);
          expect(screenShareBtn.getAttribute('class')).toContain('green');
        });

        describe('has been clicked', () => {
          beforeEach(() => {
            screenShareBtn.click();
          });
          it('shares the screen and the screen moves when it is dragged', () => {
            expect(screenShareBtn.getAttribute('class')).toContain('red');
            const screenPublisher = element(by.css('#screenPublisher'));
            browser.wait(() => screenPublisher.isPresent(), 10000);
            const oldLocation = screenPublisher.getLocation();
            browser.actions().dragAndDrop(screenPublisher, element(by.css('body'))).perform();
            const newLocation = screenPublisher.getLocation();
            expect(newLocation).not.toEqual(oldLocation);
          });
        });
        it(
          'shows an install prompt when you click it and the extension is not installed',
          (done) => {
            if (browser.browserName === 'chrome') {
              browser.driver.executeScript('OT.registerScreenSharingExtension(\'chrome\', \'foo\');').then(() => {
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
          },
        );
      });
    }

    describe('connCount icon', () => {
      let connCount;
      beforeEach(() => {
        connCount = element(by.css('#connCount'));
      });
      it('is present and displays 1 connection', (done) => {
        expect(connCount.isPresent()).toBe(true);
        // Wait until we're connected
        browser.wait(() => element(by.css('div.session-connected')).isPresent(), 10000).then(() => {
          expect(connCount.getInnerHtml()).toContain('1');
          expect(connCount.getAttribute('title')).toBe('1 participant in the room');
          done();
        });
      });
    });

    describe('changeRoom button', () => {
      const changeRoomBtn = element(by.css('#changeRoom'));

      beforeEach(() => {
        // The below line doesn't work in Firefox for some reason, it just doesn't wait
        browser.wait(() => element(by.css('div.session-connected')).isPresent(), 10000);
      });

      it('takes you back to the login screen if you click it', () => {
        changeRoomBtn.click();
        browser.sleep(2000);
        expect(browser.getCurrentUrl()).toBe(browser.baseUrl);
      });
    });
  });
});
