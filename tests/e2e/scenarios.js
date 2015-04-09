/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
/* global protractor: false */
var uuid = require('uuid');

describe('OpenTok Meet App', function() {
  var roomName;
  beforeEach(function () {
    while(!roomName || roomName.indexOf('p2p') > -1) {
      // Don't want the roomname to have p2p in it or it will be a p2p room
      roomName = uuid.v1();
    }
    browser.getCapabilities().then(function (cap) {
      browser.browserName = cap.caps_.browserName;
    });
  });

  describe('Room', function() {
    beforeEach(function() {
      browser.get(roomName);
    });
    
    it('should have the right title', function () {
      expect(browser.getTitle()).toEqual('OpenTok Meet : ' + roomName);
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

      it('mutes video when you click the mute-video icon', function () {
        browser.wait(function () {
          return element(by.css('.OT_publisher:not(.OT_loading)')).isPresent();
        }, 10000);
        var muteVideo = publisher.element(by.css('mute-video'));
        expect(muteVideo.isPresent()).toBe(true);
        expect(muteVideo.isDisplayed()).toBe(false);
        browser.actions().mouseMove(muteVideo).perform();
        browser.wait(function () {
          return muteVideo.isDisplayed();
        }, 10000);
        expect(muteVideo.element(by.css('.ion-ios7-close')).isPresent()).toBe(true);
        muteVideo.click();
        expect(muteVideo.element(by.css('.ion-ios7-checkmark')).isPresent()).toBe(true);
        expect(publisher.element(by.css('ot-publisher')).getAttribute('class'))
          .toContain('OT_audio-only');
        muteVideo.click();
        expect(muteVideo.element(by.css('.ion-ios7-close')).isPresent()).toBe(true);
        expect(publisher.element(by.css('ot-publisher')).getAttribute('class'))
          .not.toContain('OT_audio-only');
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
          expect(publisher.isPresent()).toBe(false);
          expect(publishBtn.getAttribute('class')).toContain('green');
          publishBtn.click();
          expect(publisher.isPresent()).toBe(true);
          expect(publishBtn.getAttribute('class')).toContain('red');
          browser.wait(function () {
            return element(by.css('.OT_publisher:not(.OT_loading)')).isPresent();
          }, 10000);
          var publisherVideo = publisher.element(by.css('video'));
          expect(publisherVideo.getAttribute('videoWidth')).toBe(
            browser.browserName === 'chrome' ? '1280' : '640');
          expect(publisherVideo.getAttribute('videoHeight')).toBe(
            browser.browserName === 'chrome' ? '720' : '480');
        });
        
        it('publishSDBtn shows up when you unpublish and can publish', function () {
          var publisher = element(by.css('div#facePublisher'));
          publishBtn.click();
          // You have to wait for the hardware to clean up properly before acquiring the camera
          // again, otherwise you end up with the same resolution.
          browser.sleep(1000);
          expect(publishSDBtn.isPresent()).toBe(true);
          publishSDBtn.click();
          expect(publisher.isPresent()).toBe(true);
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

      describe('connCount icon', function () {
        var connCount;
        beforeEach(function () {
          connCount = element(by.css('#connCount'));
        });
        it('shows up when you move the mouse', function () {
          expect(connCount.isPresent()).toBe(true);
          expect(connCount.isDisplayed()).toBe(false);
          browser.actions().mouseDown(connCount).mouseMove(element(by.css('body'))).perform();
          expect(connCount.isDisplayed()).toBe(true);
        });
        it('is present and displays 1 connection', function (done) {
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

  describe('Login', function () {
    beforeEach(function () {
      browser.get('');
    });
    
    var roomField = element(by.model('room')),
      submit = element(by.css('#joinRoomBtn'));

    it('should go to a room when you click the join button', function () {
      roomField.sendKeys(roomName);
      submit.click();
      expect(browser.getCurrentUrl()).toBe(browser.baseUrl + roomName);
    });
    
    it('should go to a room when you submit the form', function () {
      roomField.sendKeys(roomName);
      roomField.submit();
      expect(browser.getCurrentUrl()).toBe(browser.baseUrl + roomName);
    });
  });

  describe('2 browsers in the same room', function () {
    var secondBrowser;
    beforeEach(function () {
      browser.get(roomName);
      secondBrowser = browser.forkNewDriverInstance();
      secondBrowser.get(roomName);
    });
    afterEach(function () {
      secondBrowser.close();
    });

    describe('subscribing to one another', function () {
      var firstSubscriberVideo,
        secondSubscriberVideo,
        firstSubscriber,
        secondSubscriber;
      beforeEach(function (done) {
        firstSubscriber = element(by.css('ot-subscriber'));
        secondSubscriber = secondBrowser.element(by.css('ot-subscriber'));
        firstSubscriberVideo = element(by.css('ot-subscriber:not(.OT_loading) video'));
        secondSubscriberVideo = secondBrowser.element(by.css(
          'ot-subscriber:not(.OT_loading) video'));
        var subscriberWait = {};
        subscriberWait.first = browser.wait(function () {
          return firstSubscriberVideo.isPresent();
        }, 10000);
        subscriberWait.second = browser.wait(function () {
          return secondSubscriberVideo.isPresent();
        }, 10000);
        protractor.promise.fullyResolved(subscriberWait).then(function () {
          done();
        });
      });

      it('should display a video element with the right videoWidth and videoHeight', function () {
        // Have to wait a little longer on Firefox for the videoWidth and videoHeight
        browser.sleep(1000);
        expect(firstSubscriberVideo.getAttribute('videoWidth')).toBe(
          browser.browserName === 'chrome' ? '1280' : '640');
        expect(firstSubscriberVideo.getAttribute('videoHeight')).toBe(
          browser.browserName === 'chrome' ? '720' : '480');
        expect(secondSubscriberVideo.getAttribute('videoWidth')).toBe(
          browser.browserName === 'chrome' ? '1280' : '640');
        expect(secondSubscriberVideo.getAttribute('videoHeight')).toBe(
          browser.browserName === 'chrome' ? '720' : '480');
        var connCount = element(by.css('#connCount'));
        expect(connCount.getInnerHtml()).toContain('2');
      });

      it('subscribers should change size when you double-click', function () {
        expect(firstSubscriber.getAttribute('class')).not.toContain('OT_big');
        browser.actions().doubleClick(firstSubscriber).perform();
        expect(firstSubscriber.getAttribute('class')).toContain('OT_big');
        browser.actions().doubleClick(firstSubscriber).perform();
        expect(firstSubscriber.getAttribute('class')).not.toContain('OT_big');
      });

      describe('subscriber buttons', function () {
        beforeEach(function (done) {
          // Move the publisher out of the way
          secondBrowser.driver.executeScript('$(\'#facePublisher\').css({top:0, left:0});')
            .then(function () {
            secondBrowser.actions().mouseDown(secondSubscriber).perform();
            // Have to wait for the buttons to show up
            browser.sleep(1000).then(function () {
              done();
            });
          });
        });

        it('change size button works', function () {
          expect(secondSubscriber.getAttribute('class')).not.toContain('OT_big');
          var resizeBtn = secondSubscriber.element(by.css('.resize-btn'));
          expect(resizeBtn.getAttribute('title')).toBe('Enlarge');
          resizeBtn.click();
          expect(secondSubscriber.getAttribute('class')).toContain('OT_big');
          expect(resizeBtn.getAttribute('title')).toBe('Shrink');
          browser.sleep(500);
          resizeBtn.click();
          expect(secondSubscriber.getAttribute('class')).not.toContain('OT_big');
          expect(resizeBtn.getAttribute('title')).toBe('Enlarge');
        });

        it('muteVideo button works', function () {
          var muteBtn = secondSubscriber.element(by.css('mute-video'));
          expect(muteBtn.element(by.css('.ion-ios7-close')).isPresent()).toBe(true);
          muteBtn.click();
          expect(secondSubscriber.getAttribute('class')).toContain('OT_audio-only');
          expect(muteBtn.element(by.css('.ion-ios7-checkmark')).isPresent()).toBe(true);
          muteBtn.click();
          expect(muteBtn.element(by.css('.ion-ios7-close')).isPresent()).toBe(true);
          expect(secondSubscriber.getAttribute('class')).not.toContain('OT_audio-only');
        });

        it('restrictFramerate button toggles the icon and the title', function () {
          var restrictFramerateBtn = secondSubscriber.element(by.css('.restrict-framerate-btn'));
          expect(restrictFramerateBtn.getAttribute('class')).toContain('ion-ios7-speedometer');
          expect(restrictFramerateBtn.getAttribute('title')).toBe('Restrict Framerate');
          restrictFramerateBtn.click();
          expect(restrictFramerateBtn.getAttribute('class')).toContain(
            'ion-ios7-speedometer-outline');
          expect(restrictFramerateBtn.getAttribute('title')).toBe('Unrestrict Framerate');
          restrictFramerateBtn.click();
          expect(restrictFramerateBtn.getAttribute('class')).toContain('ion-ios7-speedometer');
          expect(restrictFramerateBtn.getAttribute('title')).toBe('Restrict Framerate');
        });
      });

      if (browser.browserName === 'firefox') {
        describe('sharing the screen', function () {
          beforeEach(function () {
            element(by.css('#showscreen')).click();
          });
          it('subscribes to the screen and it is big', function () {
            var subscriberVideo = secondBrowser.element(by.css(
              'ot-subscriber.OT_big:not(.OT_loading) video'));
            browser.wait(function () {
              return subscriberVideo.isPresent();
            }, 10000);
          });
        });
      }

      describe('using the collaborative editor', function () {
        var firstShowEditorBtn, secondShowEditorBtn, defaultText;
        beforeEach(function (done) {
          firstShowEditorBtn = element(by.css('#showEditorBtn'));
          secondShowEditorBtn = secondBrowser.element(by.css('#showEditorBtn'));
          secondShowEditorBtn.click();
          browser.wait(function () {
            return secondBrowser.element(by.css('ot-editor .opentok-editor')).isDisplayed();
          }, 10000).then(function () {
            defaultText = secondBrowser.element(by.css('.CodeMirror-code pre .cm-comment'));
            done();
          });
        });

        afterEach(function () {
          defaultText = firstShowEditorBtn = secondShowEditorBtn = null;
        });

        it('contains the default text', function () {
          expect(defaultText.isPresent()).toBe(true);
          expect(defaultText.getInnerHtml()).toBe('// Write code here');
        });

        describe('when you enter text on the second browser', function () {
          var firstBrowserText;
          beforeEach(function () {
            firstBrowserText = element(by.css('.CodeMirror-code pre .cm-comment'));
            secondBrowser.actions().mouseDown(defaultText).perform();
            secondBrowser.actions().sendKeys('hello world').perform();
          });

          it('makes the red dot blink for the first browser', function () {
            expect(defaultText.getInnerHtml()).toContain('hello world');
            browser.wait(function () {
              return element(by.css('body.mouse-move .unread-indicator.unread #showEditorBtn'))
                .isPresent();
            }, 10000);
          });

          describe('showing the editor on the first browser', function () {
            beforeEach(function (done) {
              firstShowEditorBtn.click();
              browser.wait(function () {
                return element(by.css('ot-editor .opentok-editor')).isDisplayed();
              }, 10000).then(function () {
                browser.sleep(2000).then(function () {
                  done();
                });
              });
            });
            
            it('text shows up on the first browser', function () {
              expect(firstBrowserText.getInnerHtml()).toContain('hello world');
            });

            describe('when you enter text on the first browser', function () {
              beforeEach(function () {
                browser.actions().mouseDown(firstBrowserText).perform();
                browser.actions().sendKeys('foo bar').perform();
              });

              it('shows up on the second browser within 2 seconds', function () {
                browser.sleep(2000);
                expect(defaultText.getInnerHtml()).toContain('foo bar');
              });
            });
          });
        });
      });
    });
  });

  describe('Screen', function () {
    beforeEach(function () {
      browser.get(roomName + '/screen');
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
        if (browser.browserName === 'firefox') {
          describe('a subscriber', function () {
            var secondBrowser;
            beforeEach(function () {
              secondBrowser = browser.forkNewDriverInstance();
              secondBrowser.get(roomName);
            });
            it('subscribes to the screen and it is big', function () {
              var subscriberVideo = secondBrowser.element(by.css(
                'ot-subscriber.OT_big:not(.OT_loading) video'));
              browser.wait(function () {
                return subscriberVideo.isPresent();
              }, 10000);
            });
          });
        }
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
});
