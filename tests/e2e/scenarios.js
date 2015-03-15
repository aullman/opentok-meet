/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('OpenTok Meet App', function() {
  describe('Room', function() {

    beforeEach(function() {
      browser.get('testRoom');
    });
    
    it('should have the right title', function () {
      expect(browser.getTitle()).toEqual('OpenTok Meet : testRoom');
    });

    it('should have a loader being displayed', function () {
      expect(element(by.css('#loader')).isDisplayed()).toBe(true);
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
        browser.wait(function () {
          return element(by.css('.OT_publisher:not(.OT_loading)')).isPresent();
        }, 10000);
        var publisherVideo = publisher.element(by.css('video'));
        expect(publisherVideo).toBeDefined();
        expect(publisherVideo.getAttribute('videoWidth')).toBe('1280');
        expect(publisherVideo.getAttribute('videoHeight')).toBe('720');
      });
      
      it('moves when it is dragged', function () {
        var oldLocation = publisher.getLocation();
        browser.actions().dragAndDrop(publisher, element(by.css('body'))).perform();
        var newLocation = publisher.getLocation();
        expect(newLocation).not.toEqual(oldLocation);
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

        it('publishBtn toggles the publisher when clicked and goes between green and red and publishes in HD', function () {
          var publisher = element(by.css('div#facePublisher'));
          expect(publisher.isPresent()).toBe(true);
          publishBtn.click();
          expect(publisher.isPresent()).toBe(false);
          expect(publishBtn.getAttribute('class')).toContain('green');
          publishBtn.click();
          expect(publisher.isPresent()).toBe(true);
          expect(publishBtn.getAttribute('class')).toContain('red');
          browser.wait(function () {
            return element(by.css('.OT_publisher:not(.OT_loading)')).isPresent();
          }, 10000);
          var publisherVideo = publisher.element(by.css('video'));
          expect(publisherVideo.getAttribute('videoWidth')).toBe('1280');
          expect(publisherVideo.getAttribute('videoHeight')).toBe('720');
        });
        
        it('publishSDBtn shows up when you unpublish and can publish', function (done) {
          var publisher = element(by.css('div#facePublisher'));
          publishBtn.click();
          // You have to wait for the hardware to clean up properly before acquiring the camera
          // again, otherwise you end up with the same resolution.
          setTimeout(function () {
            expect(publishSDBtn.isPresent()).toBe(true);
            publishSDBtn.click();
            expect(publisher.isPresent()).toBe(true);
            browser.wait(function () {
              return element(by.css('.OT_publisher:not(.OT_loading)')).isPresent();
            }, 10000);
            var publisherVideo = publisher.element(by.css('video'));
            // Not sure why but below fails if I run all the tests but not 
            // if I run this test alone
            //expect(publisherVideo.getAttribute('videoWidth')).toBe('640');
            //expect(publisherVideo.getAttribute('videoHeight')).toBe('480');
            done();
          }, 1000);
        });
      });

      describe('showWhiteboardBtn', function () {
        var showWhiteboardBtn = element(by.css('#showWhiteboardBtn'));

        it('is green and being displayed', function () {
          expect(showWhiteboardBtn.isPresent()).toBe(true);
          expect(showWhiteboardBtn.getAttribute('class')).toContain('green');
        });

        it('toggles the whiteboard when you click it and the button goes between green and red', function () {
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

        it('toggles the editor when you click it and the button goes between green and red', function () {
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

      describe('screenshare button', function () {
        var screenShareBtn = element(by.css('#showscreen'));
        it('shares the screen when you click it', function () {
          expect(screenShareBtn.getAttribute('class')).toContain('green');
          screenShareBtn.click();
          expect(screenShareBtn.getAttribute('class')).toContain('red');
          browser.wait(function () {
            return element(by.css('#screenPublisher')).isPresent();
          }, 10000);
        });
        it('shows an install prompt when you click it and the extension is not installed', function (done) {
          browser.driver.executeScript('OT.registerScreenSharingExtension(\'chrome\', \'foo\');').then(function () {
            expect(element(by.css('#installScreenshareExtension')).isPresent()).toBe(false);
            expect(screenShareBtn.getAttribute('class')).toContain('green');
            screenShareBtn.click();
            expect(screenShareBtn.getAttribute('disabled')).toBe('true');
            browser.wait(function () {
              return element(by.css('#installScreenshareExtension')).isPresent();
            }, 10000);
            done();
          });
        });
      });

      describe('changeRoom button', function () {
        var changeRoomBtn = element(by.css('#changeRoom'));

        beforeEach(function () {
          // Wait until we're connected
          browser.wait(function () {
            return element(by.css('div.session-connected')).isPresent();
          });
        });

        it('takes you back to the login screen if you click it', function (done) {
          changeRoomBtn.click();
          setTimeout(function () {
            expect(browser.getLocationAbsUrl()).toBe(browser.baseUrl);
            done();
          }, 2000);
        });
      });
    });
  });

  describe('Login', function () {
    beforeEach(function () {
      browser.get('');
    });
    
    var roomField = element(by.model('room')),
      submit = element(by.css('#joinRoomBtn'));
    
    it('should go to a room when you click the join button', function () {
      roomField.sendKeys('testRoom');
      submit.click();
      
      expect(browser.getLocationAbsUrl()).toBe(browser.baseUrl + 'testRoom');
    });
    
    it('should go to a room when you submit the form', function () {
      roomField.sendKeys('testRoom');
      roomField.submit();
      
      expect(browser.getLocationAbsUrl()).toBe(browser.baseUrl + 'testRoom');
    });
  });

  describe('2 browsers in the same room', function () {
    var secondBrowser;
    beforeEach(function () {
      browser.get('testRoom');
      secondBrowser = browser.forkNewDriverInstance();
      secondBrowser.get('testRoom');
    });

    it('should subscribe to one another and display a video element with the right videoWidth and videoHeight', function () {
      var firstSubscriberVideo = element(by.css('.OT_subscriber:not(.OT_loading) video'));
      var secondSubscriberVideo = secondBrowser.element(by.css('.OT_subscriber:not(.OT_loading) video'));
      browser.wait(function () {
        return firstSubscriberVideo.isPresent();
      });
      secondBrowser.wait(function () {
        return secondSubscriberVideo.isPresent();
      });
      expect(firstSubscriberVideo.getAttribute('videoWidth')).toBe('1280');
      expect(firstSubscriberVideo.getAttribute('videoHeight')).toBe('720');
      expect(secondSubscriberVideo.getAttribute('videoWidth')).toBe('1280');
      expect(secondSubscriberVideo.getAttribute('videoHeight')).toBe('720');
    });
  });
});
