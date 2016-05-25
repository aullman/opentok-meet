/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* global browser: false */
/* global element: false */
/* global by: false */
var uuid = require('uuid');
describe('OpenTok Meet App', function() {
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
    });
  });

  afterEach(function () {
    roomName = roomURL = null;
  });

  describe('Login', function () {
    beforeEach(function () {
      browser.get('');
    });

    var roomField = element(by.model('room')),
      submit = element(by.css('#joinRoomBtn'));

    xit('should go to a room when you click the join button', function () {
      roomField.sendKeys(roomName);
      submit.click();
      expect(browser.getCurrentUrl()).toBe(browser.baseUrl + roomName);
    });

    it('should go to a room when you submit the form', function () {
      roomField.sendKeys(roomName);
      roomField.submit();

      if (browser.browserName !== 'firefox') {
        // fixme: for some reason Firefox sometimes gives an error about not being able to
        // sync with the page 
        expect(browser.getCurrentUrl().then(function (url) {
          // For some reason in IE sometimes when you run lots of tests
          // the whole URL isn't there
          return (browser.baseUrl + roomName).indexOf(url) === 0;
        })).toBe(true);
      }
    });

    describe('p2p checkbox', function () {
      var p2p = element(by.model('p2p'));
      it('should add and remove p2p to the name when you click it', function () {
        roomField.sendKeys(roomName);
        p2p.click();
        expect(roomField.getAttribute('value')).toBe(roomName + 'p2p');
        p2p.click();
        expect(roomField.getAttribute('value')).toBe(roomName);
        // should check when you enter p2p into the input field
        roomField.sendKeys('p2p');
        browser.wait(function () {
          return p2p.getAttribute('checked');
        });
      });
    });
  });

  describe('Room', function() {
    beforeEach(function() {
      browser.get(roomURL);
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

      // This isn't passing in browserstack for some reason need to figure out why
      xit('mutes video when you click the mute-video icon', function () {
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

  describe('using the collaborative editor', function () {
    var secondBrowser;
    beforeEach(function () {
      browser.get(roomURL);
    });
    afterEach(function () {
      if (secondBrowser) {
        secondBrowser.quit();
      }
    });
    it('text editing works', function (done) {
      browser.wait(function () {
        return element(by.css('ot-editor')).isPresent();
      }, 5000);
      var firstShowEditorBtn = element(by.css('#showEditorBtn'));
      browser.actions().mouseMove(firstShowEditorBtn).perform();
      firstShowEditorBtn.click();
      browser.wait(function () {
        return element(by.css('ot-editor .opentok-editor')).isDisplayed();
      }, 5000);

      browser.sleep(2000);
      // enter text into first browser
      var firstBrowserText = element(by.css('.CodeMirror-code pre .cm-comment'));
      expect(firstBrowserText.isPresent()).toBe(true);
      browser.actions().mouseDown(firstBrowserText).mouseUp().perform();
      browser.actions().sendKeys('foo').sendKeys('bar').perform();
      browser.wait(function () {
        return firstBrowserText.getInnerHtml().then(function (innerHTML) {
          return innerHTML.indexOf('bar') > -1;
        });
      }, 2000);

      secondBrowser = browser.forkNewDriverInstance(true);
      // Wait for flashing red dot indicator
      secondBrowser.wait(function () {
        return secondBrowser.element(by.css('body.mouse-move .unread-indicator.unread #showEditorBtn'))
          .isPresent();
      }, 10000);
      secondBrowser.element(by.css('button#showEditorBtn')).click();

      secondBrowser.wait(function () {
        return secondBrowser.element(by.css('ot-layout ot-editor .opentok-editor')).isDisplayed();
      }, 5000);

      secondBrowser.sleep(2000);
      // enter text into second browser
      var secondBrowserText = secondBrowser.element(by.css('.CodeMirror-code pre span.cm-comment'));
      expect(secondBrowserText.isPresent()).toBe(true);
      secondBrowser.actions().mouseMove(secondBrowserText).mouseDown(secondBrowserText)
        .mouseUp().perform();
      secondBrowser.actions().sendKeys('hello').sendKeys('world').perform();
      var secondInnerHTML;
      secondBrowser.wait(function () {
        return secondBrowserText.getInnerHtml().then(function (innerHTML) {
          secondInnerHTML = innerHTML;
          return innerHTML.indexOf('world') > -1;
        });
      }, 2000);
      secondBrowser.sleep(2000).then(function () {
        // wait for text to show up in the first browser
        browser.wait(function () {
          return firstBrowserText.getInnerHtml().then(function (innerHTML) {
            return innerHTML === secondInnerHTML;
          });
        }, 10000);
        done();
      });
    });
  });

  describe('using the whiteboard', function () {
    var secondBrowser, thirdBrowser;

    var getWhiteboardData = function(browser) {
      return browser.driver.executeScript(function() {
        return document.querySelector('ot-whiteboard canvas').toDataURL('image/png');
      });
    };

    var whiteboardTests = function(showButton) {
      return function() {
        browser.wait(function () {
          return element(by.css('ot-whiteboard')) && element(by.css('ot-whiteboard')).isPresent();
        }, 5000);
        if (showButton) {
          var firstShowWhiteboardBtn = element(by.css('#showWhiteboardBtn'));
          browser.actions().mouseMove(firstShowWhiteboardBtn).perform();
          firstShowWhiteboardBtn.click();
        }
        browser.wait(function () {
          return element(by.css('ot-whiteboard')).isDisplayed();
        }, 5000);
        // draw in the first browser
        var firstBrowserCanvas = element(by.css('ot-whiteboard canvas'));
        expect(firstBrowserCanvas.isPresent()).toBe(true);
        var initialData, firstDrawData, secondDrawData;
        getWhiteboardData(browser).then(function(data) {
          initialData = data;
        });

        secondBrowser = browser.forkNewDriverInstance(true);
        // Show the whiteboard in the second browser
        var secondShowWhiteboardBtn = secondBrowser.element(by.css('#showWhiteboardBtn'));
        if (showButton) {
          secondBrowser.actions().mouseMove(secondShowWhiteboardBtn).perform();
          secondShowWhiteboardBtn.click();
        }
        secondBrowser.wait(function () {
          return secondBrowser.element(by.css('ot-whiteboard')) && secondBrowser.element(by.css('ot-whiteboard')).isPresent();
        }, 5000);
        var secondBrowserCanvas = secondBrowser.element(by.css('ot-whiteboard canvas'));
        // Check that the initial data of the second browser is the same as the first
        getWhiteboardData(secondBrowser).then(function(data) {
          expect(data).toEqual(initialData);
        }).then(function() {
          // Draw in the second browser
          secondBrowser.actions().mouseMove(secondBrowserCanvas).mouseDown()
             .mouseMove({x: 0, y:100}).mouseUp().perform();
          return getWhiteboardData(secondBrowser);
        }).then(function(data) {
          firstDrawData = data;
          expect(firstDrawData).not.toEqual(initialData);
          // Wait for the changes to show up on the first browser
          return browser.wait(function() {
            return getWhiteboardData(browser).then(function(data) {
              return data === firstDrawData;
            });
          });
        }).then(function() {
          // Draw on the first browser
          browser.actions().mouseMove(firstBrowserCanvas).mouseDown()
             .mouseMove({x: 100, y:100}).mouseUp().perform();

          return getWhiteboardData(browser);
        }).then(function(data) {
          secondDrawData = data;
          expect(secondDrawData).not.toEqual(firstDrawData);
          // Wait for the changes to show up on the second browser
          return browser.wait(function() {
            return getWhiteboardData(secondBrowser).then(function(data) {
              return data === secondDrawData;
            });
          });
        }).then(function() {
          thirdBrowser = browser.forkNewDriverInstance(true);
          // Wait for flashing red dot indicator in the third browser
          if (showButton) {
            thirdBrowser.wait(function () {
              return thirdBrowser.element(by.css('body.mouse-move .unread-indicator.unread #showWhiteboardBtn'))
                .isPresent();
            }, 30000);
          }
          browser.wait(function () {
            return thirdBrowser.element(by.css('ot-whiteboard')) && thirdBrowser.element(by.css('ot-whiteboard')).isPresent();
          }, 5000);

          return thirdBrowser.wait(function() {
            return getWhiteboardData(thirdBrowser).then(function(data) {
              return data === secondDrawData;
            });
          });
        });
      };
    };
    afterEach(function () {
      if (secondBrowser) {
        secondBrowser.quit();
      }
      if (thirdBrowser) {
        thirdBrowser.quit();
      }
    });

    describe('in the room', function() {
      beforeEach(function () {
        browser.get(roomURL);
      });
      it('drawing works', whiteboardTests(true));
    });

    describe('standalone', function() {
      beforeEach(function () {
        browser.get(roomURL + '/whiteboard');
      });
      it('drawing works', whiteboardTests(false));
    });
  });

  describe('2 browsers in the same room', function () {
    var secondBrowser;
    beforeEach(function () {
      browser.get(roomURL);
      secondBrowser = browser.forkNewDriverInstance(true);
      secondBrowser.browserName = browser.browserName;
    });
    afterEach(function () {
      if (secondBrowser) {
        secondBrowser.quit();
      }
    });

    describe('subscribing to one another', function () {
      beforeEach(function () {
        browser.wait(function () {
          return element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element')).isPresent();
        }, 20000);
        secondBrowser.wait(function () {
          return secondBrowser.element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element')).isPresent();
        }, 20000);
      });

      it('should display a video element with the right videoWidth and videoHeight', function () {
        var checkVideo = function(browser) {
          var subscriberVideo =
            browser.element(by.css('ot-subscriber:not(.OT_loading) .OT_video-element'));
          expect(subscriberVideo.getAttribute('videoWidth')).toBe(
            browser.browserName === 'chrome' ? '1280' : '640');
          expect(subscriberVideo.getAttribute('videoHeight')).toBe(
            browser.browserName === 'chrome' ? '720' : '480');
          var connCount = browser.element(by.css('#connCount'));
          expect(connCount.getInnerHtml()).toContain('2');
        };
        checkVideo(browser);
        checkVideo(secondBrowser);
      });

      it('subscribers should change size when you double-click', function () {
        var subscriber = secondBrowser.element(by.css('ot-subscriber'));
        expect(subscriber.getAttribute('class')).not.toContain('OT_big');
        secondBrowser.actions().doubleClick(subscriber).perform();
        expect(subscriber.getAttribute('class')).toContain('OT_big');
        secondBrowser.actions().doubleClick(subscriber).perform();
        expect(subscriber.getAttribute('class')).not.toContain('OT_big');
      });

      describe('subscriber buttons', function () {
        var secondSubscriber;
        beforeEach(function (done) {
          secondSubscriber = secondBrowser.element(by.css('ot-subscriber'));
          // Move the publisher out of the way
          secondBrowser.driver.executeScript('$(\'#facePublisher\').css({top:200, left:0});')
            .then(function () {
            secondBrowser.actions().mouseDown(secondSubscriber).mouseUp().perform();
            // Have to wait for the buttons to show up
            secondBrowser.sleep(1000).then(function () {
              done();
            });
          });
        });

        it('change size button works', function () {
          expect(secondSubscriber.getAttribute('class')).not.toContain('OT_big');
          var resizeBtn = secondSubscriber.element(by.css('.resize-btn'));
          expect(resizeBtn.getAttribute('title')).toBe('Enlarge');
          resizeBtn.click();
          secondBrowser.wait(function () {
            return secondSubscriber.getAttribute('class').then(function (className) {
              return className.indexOf('OT_big') > -1;
            });
          }, 5000);
          expect(resizeBtn.getAttribute('title')).toBe('Shrink');
          secondBrowser.actions().mouseDown(secondSubscriber).mouseUp().perform();
          resizeBtn.click();
          secondBrowser.wait(function () {
            return secondSubscriber.getAttribute('class').then(function (className) {
              return className.indexOf('OT_big') === -1;
            });
          }, 5000);
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

        it('stats button works', function() {
          var showStatsInfo = secondSubscriber.element(by.css('.show-stats-info'));
          var statsButton = secondSubscriber.element(by.css('.show-stats-btn'));
          expect(showStatsInfo.isDisplayed()).toBe(false);
          statsButton.click();
          secondBrowser.wait(function() {
            return showStatsInfo.isDisplayed();
          }, 2000);
          expect(showStatsInfo.isDisplayed()).toBe(true);
          secondBrowser.wait(function() {
            return showStatsInfo.getInnerHtml().then(function(innerHTML) {
              var statsRegexp = new RegExp('Resolution: \\d+x\\d+<br>.*' +
                'Audio Packet Loss: \\d\\d?\\.\\d\\d%<br>' +
                'Audio Bitrate: \\d+ kbps<br>.*' +
                'Video Packet Loss: \\d\\d?\\.\\d\\d%<br>' +
                'Video Bitrate: \\d+ kbps', 'gi');
              return statsRegexp.test(innerHTML);
            });
          }, 5000);
        });
      });

      if (browser.params.testScreenSharing) {
        describe('sharing the screen', function () {
          beforeEach(function () {
            var showScreenBtn = secondBrowser.element(by.css('#showscreen'));
            secondBrowser.actions().mouseMove(showScreenBtn).perform();
            showScreenBtn.click();
          });
          it('subscribes to the screen and it is big', function () {
            var subscriberVideo = element(by.css(
              'ot-subscriber.OT_big:not(.OT_loading) video'));
            browser.wait(function () {
              return subscriberVideo.isPresent();
            }, 10000);
          });
        });
      }

      describe('disconnecting', function () {
        var connCount, firstSubscriber;
        beforeEach(function () {
          firstSubscriber = element(by.css('ot-subscriber'));
          connCount = element(by.css('#connCount'));
          expect(firstSubscriber.isPresent()).toBe(true);
          expect(connCount.getInnerHtml()).toContain('2');
        });

        afterEach(function () {
          // Wait 5 seconds for the connection count to go down to 1
          browser.wait(function () {
            return connCount.getInnerHtml().then(function (innerHTML) {
              return innerHTML.trim() === '1';
            });
          }, 5000);
          // Wait 5 seconds for the Subscriber to go away
          browser.wait(function () {
            return firstSubscriber.isPresent().then(function (present) {
              return !present;
            });
          }, 5000);
        });

        it('with change room button', function () {
          // Disconnect the second browser
          secondBrowser.element(by.css('#changeRoom')).click();
        });
        it('by closing the browser window', function () {
          secondBrowser.quit();
          secondBrowser = null;
        });
      });
    });
  });

  if (browser.params.testScreenSharing) {
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
          describe('a subscriber', function () {
            var secondBrowser;
            beforeEach(function () {
              secondBrowser = browser.forkNewDriverInstance(false);
              secondBrowser.get(roomURL);
            });
            afterEach(function() {
              secondBrowser.quit();
            });
            it('subscribes to the screen and it is big', function () {
              var subscriberVideo = secondBrowser.element(by.css(
                'ot-subscriber.OT_big:not(.OT_loading) video'));
              secondBrowser.wait(function () {
                return subscriberVideo.isPresent();
              }, 10000);
            });
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
    });
  }
});
