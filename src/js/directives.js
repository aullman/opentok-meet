angular.module('opentok-meet').directive('draggable', ['$document', '$window',
  function draggable($document, $window) {
    const getEventProp = (event, prop) => {
      if (event[prop] === 0) return 0;
      return event[prop] || (event.touches && event.touches[0][prop]) ||
      (event.originalEvent && event.originalEvent.touches &&
      event.originalEvent.touches[0][prop]);
    };

    return (scope, element) => {
      let position = element.css('position');
      let startX = 0;
      let startY = 0;
      let x = 0;
      let y = 0;

      const mouseMoveHandler = function mouseMoveHandler(event) {
        y = getEventProp(event, 'pageY') - startY;
        x = getEventProp(event, 'pageX') - startX;
        element.css({
          top: `${y}px`,
          left: `${x}px`,
        });
      };

      const resizeHandler = function resizeHandler() {
      // Always make sure that the element is on the page when it is resized
        const winHeight = angular.element($window).height();
        const winWidth = angular.element($window).width();
        if (winHeight - element.height() < parseInt(element.css('top'), 10)) {
        // We're too short switch to being bottom aligned
          element.css({
            top: 'auto',
            bottom: '10px',
          });
        }
        if (winWidth - element.width() < parseInt(element.css('left'), 10)) {
        // We're too narrow, switch to being right aligned
          element.css({
            left: 'auto',
            right: '10px',
          });
        }
      };

      const mouseUpHandler = function mouseUpHandler() {
        $document.unbind('mousemove touchmove', mouseMoveHandler);
        $document.unbind('mouseup touchend', mouseUpHandler);
        // We only want to add this event once so we remove it in case we already
        // added it previously
        angular.element($window).unbind('resize', resizeHandler);
        angular.element($window).on('resize', resizeHandler);
      };

      if (position !== 'relative' && position !== 'absolute') {
        element.css('positon', 'relative');
        position = 'relative';
      }

      element.on('mousedown touchstart', (event) => {
        if (event.target instanceof HTMLButtonElement) {
        // If they're trying to click on a button then don't drag
          return;
        }
        event.preventDefault();
        const pageX = getEventProp(event, 'pageX');
        const pageY = getEventProp(event, 'pageY');

        switch (position) {
          case 'relative':
            startX = pageX - x;
            startY = pageY - y;
            break;
          case 'absolute':
          default:
            startX = pageX - element.context.offsetLeft;
            startY = pageY - element.context.offsetTop;
            break;
        }
        $document.on('mousemove touchmove', mouseMoveHandler);
        $document.on('mouseup touchend', mouseUpHandler);
        $($document[0].body).on('mouseleave', mouseUpHandler);
      });
    };
  }])
  .directive('muteVideo', () => ({
    restrict: 'E',
    template: '<i class="video-icon ion-ios7-videocam" ' +
      'title="{{mutedVideo ? \'Unmute Video\' : \'Mute Video\'}}"></i>' +
      '<i class="cross-icon" ng-class="' +
      '{\'ion-ios7-checkmark\': mutedVideo, \'ion-ios7-close\': !mutedVideo}" ' +
      'title="{{mutedVideo ? \'Unmute Video\' : \'Mute Video\'}}"' +
      '</i>',
  }))
  .directive('muteSubscriber', ['OTSession', function muteSubscriber(OTSession) {
    return {
      restrict: 'A',
      link(scope, element) {
        let subscriber;
        scope.mutedVideo = false;
        angular.element(element).on('click', () => {
          if (!subscriber) {
            subscriber = OTSession.session.getSubscribersForStream(scope.stream)[0];
          }
          if (subscriber) {
            subscriber.subscribeToVideo(scope.mutedVideo);
            scope.mutedVideo = !scope.mutedVideo;
            scope.$apply();
          }
        });
        scope.$on('$destroy', () => {
          subscriber = null;
        });
      },
    };
  }])
  .directive('mutePublisher', ['OTSession', function mutePublisher(OTSession) {
    return {
      restrict: 'A',
      link(scope, element, attrs) {
        const type = attrs.mutedType || 'Video';
        scope[`muted${type}`] = false;

        const getPublisher = () =>
          OTSession.publishers.filter(el => el.id === attrs.publisherId)[0];

        angular.element(element).on('click', () => {
          const publisher = getPublisher();
          if (publisher) {
            publisher[`publish${type}`](scope[`muted${type}`]);
            scope[`muted${type}`] = !scope[`muted${type}`];
            scope.$apply();
          }
        });
        const listenForStreamChanges = () => {
          OTSession.session.addEventListener('streamPropertyChanged', (event) => {
            const publisher = getPublisher();
            if (publisher && publisher.stream &&
            publisher.stream.streamId === event.stream.streamId) {
              scope[`muted${type}`] = !event.stream[`has${type}`];
              scope.$apply();
            }
          });
        };
        if (OTSession.session) {
          listenForStreamChanges();
        } else {
          OTSession.on('init', listenForStreamChanges);
        }
      },
    };
  }])
  .directive('restrictFramerate', ['OTSession', function restrictFramerate(OTSession) {
    return {
      restrict: 'E',
      template: '<button class="restrict-framerate-btn" title="Toggle Framerate">' +
        '<span class="restrict-framerate-btn-text" ng-if="frameRate != null">' +
          '{{ frameRate }}fps</span>' +
        '<i class="restrict-framerate-btn-icon" ng-class="' +
        '{\'ion-ios7-speedometer-outline\': frameRate != null, ' +
        '\'ion-ios7-speedometer\': frameRate == null}"></i>' +
      '</button>',
      link(scope, element) {
        let cancelRestrict;
        const frameRateOptions = [15, 7, 1, null];
        scope.frameRate = null;

        function nextFrameRate(frameRate) {
          let frameRateIndex = frameRateOptions.indexOf(frameRate) + 1;
          if (frameRateIndex >= frameRateOptions.length) {
            frameRateIndex = 0;
          }
          return frameRateOptions[frameRateIndex];
        }

        function updateSubscriberFrameRate(stream, frameRate) {
          const subscriber = OTSession.session.getSubscribersForStream(stream)[0];

          if (frameRate === 1) {
            subscriber.restrictFrameRate(true);
            cancelRestrict = (sub) => {
              sub.restrictFrameRate(false);
              cancelRestrict = null;
            };
          } else {
            subscriber.setPreferredFrameRate(frameRate);
            if (cancelRestrict) {
              cancelRestrict(subscriber);
            }
          }
        }

        angular.element(element).on('click', () => {
          scope.frameRate = nextFrameRate(scope.frameRate);
          updateSubscriberFrameRate(scope.stream, scope.frameRate);
          scope.$apply();
        });
      },
    };
  }])
  .directive('reconnectingOverlay', ['$interval', function reconnectingOverlay($interval) {
    return {
      restrict: 'E',
      template: '<p>Reconnecting{{ dots }}</p>',
      link(scope) {
        scope.dots = '';

        const intervalPromise = $interval(() => {
          scope.dots += '.';

          if (scope.dots.length > 3) {
            scope.dots = '';
          }
        }, 1000);

        scope.$on('$destroy', () => {
          $interval.cancel(intervalPromise);
        });
      },
    };
  }])
  .directive('expandButton', ['$rootScope', function expandButton($rootScope) {
    return {
      restrict: 'E',
      template: '<button class="resize-btn ion-arrow-expand" ng-click="$emit(\'changeSize\');"' +
        ' title="{{expanded ? \'Shrink\' : \'Enlarge\'}}"></button>',
      link(scope, element) {
        if (scope.expanded === undefined) {
          // If we're a screen we default to large otherwise we default to small
          scope.expanded = scope.stream.name === 'screen';
        }
        const toggleExpand = () => {
          scope.expanded = !scope.expanded;
          scope.$apply();
          $rootScope.$broadcast('otLayout');
        };
        angular.element(element).on('click', toggleExpand);
        angular.element(element).parent().on('dblclick', toggleExpand);
      },
    };
  }])
  .directive('zoomButton', ['$rootScope', function zoomButton() {
    return {
      restrict: 'E',
      scope: {
        zoomed: '=',
      },
      template: '<button class="zoom-btn" ng-class="{\'ion-plus-circled\': !zoomed,' +
        ' \'ion-minus-circled\': zoomed}" ' +
        'title="{{zoomed ? \'Zoom Out\' : \'Zoom In\'}}"></button>',
    };
  }]);
