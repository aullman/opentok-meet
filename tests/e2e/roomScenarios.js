/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
var uuid = require('uuid');
describe('Room', function() {
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
      browser.get(roomURL);
    });
  });

  afterEach(function () {
    roomName = roomURL = null;
  });

  it('should have the right title', function () {
    expect(browser.getTitle()).toEqual('OpenTok Meet : ' + roomName);
  });

  // This isn't passing in browserstack for some reason. Need to figure out why.
  xit('should have a loader being displayed', function () {
    browser.wait(function() {
      return element(by.css('#loader')).isDisplayed();
    }, 10000);
  });

  it('should show a shareInfo message when you connect', function () {
    browser.wait(function () {
      return element(by.css('#shareInfo')).isPresent();
    }, 10000);
  });

  describe('publisher', function () {
    var publisher = element(by.css('div#facePublisher'));
    it('is displayed', function () {
      expect(publisher.isPresent()).toBe(true);
      expect(publisher.isDisplayed()).toBe(true);
    });

    it('contains a video element and is HD', function () {
      if (browser.browserName === 'internet explorer') {
        return;
      }
      browser.wait(function () {
        return element(by.css('.OT_publisher:not(.OT_loading)')).isPresent();
      }, 10000);
      var publisherVideo = publisher.element(by.css('video'));
      expect(publisherVideo).toBeDefined();
      expect(publisherVideo.getAttribute('videoWidth')).toBe(
        browser.browserName === 'chrome' ? '1280' : '640');
      expect(publisherVideo.getAttribute('videoHeight')).toBe(
        browser.browserName === 'chrome' ? '720' : '480');
    });

    it('moves when it is dragged', function () {
      var oldLocation = publisher.getLocation();
      browser.actions().dragAndDrop(publisher, element(by.css('body'))).perform();
      var newLocation = publisher.getLocation();
      expect(newLocation).not.toEqual(oldLocation);
    });

    // Note this does not actually work in Chrome because drag and drop doesn't
    // work properly in webdriver https://github.com/angular/protractor/issues/583
    it('stays on the screen if you resize too small', function() {
      expect(publisher.isDisplayed()).toBe(true);
      browser.manage().window().setSize(800, 800);
      browser.actions().mouseDown(publisher)
           .mouseMove({x: 700, y:700}).mouseUp().perform();
      browser.manage().window().setSize(500, 500);
      expect(publisher.isDisplayed()).toBe(true);
    });

    describe('mute buttons', function() {
      beforeEach(function() {
        browser.wait(function () {
          return element(by.css('.OT_publisher:not(.OT_loading)')).isPresent();
        }, 10000);
      });

      it('mutes video when you click the mute-video icon', function () {
        var muteVideo = publisher.element(by.css('mute-video'));
        expect(muteVideo.isPresent()).toBe(true);
        expect(muteVideo.isDisplayed()).toBe(false);
        browser.actions().mouseMove(muteVideo).perform();
        browser.wait(function () {
          return muteVideo.isDisplayed();
        }, 10000);
        var muteCameraButton = element(by.css('button[name="muteCamera"]'));
        browser.actions().mouseMove(muteCameraButton).perform();
        expect(muteCameraButton.isPresent()).toBe(true);
        browser.wait(function() {
          return muteCameraButton.isDisplayed();
        }, 10000);

        var verifyMuted = function(muted) {
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

      it('toggles mic when you click the mic button', function() {
        var muteMicButton = element(by.css('button[name="muteMicrophone"]'));
        expect(muteMicButton.isPresent()).toBe(true);
        var publisherMuteBtn = publisher.element(by.css('.OT_mute'));

        var verifyMuted = function(muted) {
          expect(muteMicButton.getAttribute('class')).toContain(muted ? 'green' : 'red');
          expect(muteMicButton.getAttribute('class')).toContain(
            muted ? 'ion-ios7-mic-off' : 'ion-ios7-mic');
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

    it('shows a warning icon and an alert when we get an audioAcquisitionProblem', function() {
      browser.wait(function () {
        return element(by.css('.OT_publisher:not(.OT_loading)')).isPresent();
      }, 10000);
      var audioAcquisitionProblem = element(by.css('#facePublisher audio-acquisition-problem'));
      expect(audioAcquisitionProblem.isDisplayed()).toBe(false);
      browser.driver.executeScript('OT.publishers.find().trigger(\'audioAcquisitionProblem\');')
      .then(function () {
        expect(audioAcquisitionProblem.isDisplayed()).toBe(true);
      });
    });

    it('displays an error if there is a publish error', function() {
      var publishErrors = element(by.css('ot-errors'));
      expect(publishErrors.isDisplayed()).toBe(false);
      expect(publisher.isPresent()).toBe(true);
      browser.driver.executeScript('angular.element("ot-publisher").scope().$emit' +
        '("otPublisherError", {message:"whatever"}, {id:"facePublisher"})').then(function () {
          expect(publishErrors.isDisplayed()).toBe(true);
          expect(publisher.isPresent()).toBe(false);
      });
    });
  });

  describe('footer', function () {
    it('Github link and report issue link is present', function () {
      var githubLink = element(by.css('#footer a [title="View source on GitHub"]'));
      expect(githubLink.isPresent()).toBe(true);
      var issueLink = element(by.css('#footer a [title="Report Issue"]'));
      expect(issueLink.isPresent()).toBe(true);
    });
  });

  describe('bottomBar', function () {
    describe('publish buttons', function () {
      var publishBtn = element(by.css('#publishBtn')),
        publishSDBtn = element(by.css('#publishSDBtn'));

      it('publishBtn is red and being displayed publishSDBtn is not present', function () {
        expect(publishBtn.isPresent()).toBe(true);
        expect(publishBtn.getAttribute('class')).toContain('red');
        expect(publishSDBtn.isPresent()).toBe(false);
      });

      it('publishBtn toggles the publisher when clicked and goes between green and red ' +
          'and publishes in HD', function () {
        var publisher = element(by.css('div#facePublisher'));
        expect(publisher.isPresent()).toBe(true);
        publishBtn.click();
        browser.wait(function() {
          return publisher.isPresent().then(function(present) {
            return !present;
          });
        }, 1000);
        expect(publishBtn.getAttribute('class')).toContain('green');
        publishBtn.click();
        expect(publisher.isPresent()).toBe(true);
        expect(publishBtn.getAttribute('class')).toContain('red');
        browser.wait(function () {
          return element(by.css('.OT_publisher:not(.OT_loading)')).isPresent();
        }, 10000);
        if (browser.browserName !== 'internet explorer') {
          var publisherVideo = publisher.element(by.css('video'));
          expect(publisherVideo.getAttribute('videoWidth')).toBe(
            browser.browserName === 'chrome' ? '1280' : '640');
          expect(publisherVideo.getAttribute('videoHeight')).toBe(
            browser.browserName === 'chrome' ? '720' : '480');
        }
      });

      it('publishSDBtn shows up when you unpublish and mute buttons go away', function () {
        var publisher = element(by.css('div#facePublisher'));
        var muteMicButton = element(by.css('button[name="muteMicrophone"]'));
        var muteCameraButton = element(by.css('button[name="muteCamera"]'));
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
        browser.wait(function () {
          return element(by.css('.OT_publisher:not(.OT_loading)')).isPresent();
        }, 10000);
        //var publisherVideo = publisher.element(by.css('video'));
        // Not sure why but below fails if I run all the tests but not
        // if I run this test alone
        //expect(publisherVideo.getAttribute('videoWidth')).toBe('640');
        //expect(publisherVideo.getAttribute('videoHeight')).toBe('480');
      });
    });

    describe('showWhiteboardBtn', function () {
      var showWhiteboardBtn = element(by.css('#showWhiteboardBtn'));

      it('is green and being displayed', function () {
        expect(showWhiteboardBtn.isPresent()).toBe(true);
        expect(showWhiteboardBtn.getAttribute('class')).toContain('green');
      });

      it('toggles the whiteboard when you click it and the button goes between green and red',
          function () {
        browser.wait(function () {
          return element(by.css('ot-whiteboard')).isPresent();
        }, 10000);
        var whiteboard = element(by.css('ot-whiteboard'));
        expect(whiteboard.isPresent()).toBe(true);
        expect(whiteboard.isDisplayed()).toBe(false);
        showWhiteboardBtn.click();
        expect(showWhiteboardBtn.getAttribute('class')).toContain('red');
        expect(whiteboard.isDisplayed()).toBe(true);
        showWhiteboardBtn.click();
        expect(showWhiteboardBtn.getAttribute('class')).toContain('green');
        expect(whiteboard.isDisplayed()).toBe(false);
      });
    });

    describe('showEditorBtn', function () {
      var showEditorBtn = element(by.css('#showEditorBtn'));

      it('is green and being displayed', function () {
        expect(showEditorBtn.isPresent()).toBe(true);
        expect(showEditorBtn.getAttribute('class')).toContain('green');
      });

      it('toggles the editor when you click it and the button goes between green and red',
          function () {
        browser.wait(function () {
          return element(by.css('ot-editor')).isPresent();
        }, 10000);
        var editor = element(by.css('ot-editor'));
        expect(editor.isPresent()).toBe(true);
        expect(editor.isDisplayed()).toBe(false);
        showEditorBtn.click();
        expect(editor.isDisplayed()).toBe(true);
        expect(showEditorBtn.getAttribute('class')).toContain('red');
        showEditorBtn.click();
        expect(editor.isDisplayed()).toBe(false);
        expect(showEditorBtn.getAttribute('class')).toContain('green');
      });
    });

    describe('startArchiveBtn', function () {
      var startArchiveBtn = element(by.css('#startArchiveBtn'));
      beforeEach(function () {
        browser.wait(function () {
          return startArchiveBtn.isPresent();
        }, 10000);
        browser.sleep(1000);
      });

      it('is present and green', function () {
        expect(startArchiveBtn.isPresent()).toBe(true);
        expect(startArchiveBtn.getAttribute('class')).toContain('green');
      });

      it('toggles archiving when you click it and adds an archiving status message', function () {
        startArchiveBtn.click();
        expect(startArchiveBtn.getAttribute('class')).toContain('red');
        // Wait for the archiving light to show up in the Publisher
        browser.wait(function () {
          return element(by.css('.OT_publisher .OT_archiving-on')).isPresent();
        }, 10000);
        expect(element(by.css('#archiveStatus')).isPresent()).toBe(true);
        startArchiveBtn.click();
        expect(startArchiveBtn.getAttribute('class')).toContain('green');
        // Wait for the archiving light to turn off
        browser.wait(function () {
          return element(by.css('.OT_publisher .OT_archiving-off')).isPresent();
        }, 10000);
      });
    });

    if (browser.params.testScreenSharing) {
      // Taking this out for Sauce Labs Tests for now until I can figure out how to
      // install extensions
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
          it('shares the screen and the screen moves when it is dragged', function () {
            expect(screenShareBtn.getAttribute('class')).toContain('red');
            var screenPublisher = element(by.css('#screenPublisher'));
            browser.wait(function () {
              return screenPublisher.isPresent();
            }, 10000);
            var oldLocation = screenPublisher.getLocation();
            browser.actions().dragAndDrop(screenPublisher, element(by.css('body'))).perform();
            var newLocation = screenPublisher.getLocation();
            expect(newLocation).not.toEqual(oldLocation);
          });
        });
        it('shows an install prompt when you click it and the extension is not installed',
            function (done) {
          if (browser.browserName === 'chrome') {
            browser.driver.executeScript(
              'OT.registerScreenSharingExtension(\'chrome\', \'foo\');').then(function () {
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
    }

    describe('connCount icon', function () {
      var connCount;
      beforeEach(function () {
        connCount = element(by.css('#connCount'));
      });
      it('is present and displays 1 connection', function (done) {
        expect(connCount.isPresent()).toBe(true);
        // Wait until we're connected
        browser.wait(function () {
          return element(by.css('div.session-connected')).isPresent();
        }, 10000).then(function () {
          expect(connCount.getInnerHtml()).toContain('1');
          expect(connCount.getAttribute('title')).toBe('1 participant in the room');
          done();
        });
      });
    });

    describe('changeRoom button', function () {
      var changeRoomBtn = element(by.css('#changeRoom'));

      beforeEach(function () {
        // The below line doesn't work in Firefox for some reason, it just doesn't wait
        browser.wait(function () {
          return element(by.css('div.session-connected')).isPresent();
        }, 10000);
      });

      it('takes you back to the login screen if you click it', function () {
        changeRoomBtn.click();
        browser.sleep(2000);
        expect(browser.getCurrentUrl()).toBe(browser.baseUrl);
      });
    });
  });
});
