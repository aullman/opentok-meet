angular.module('opentok-meet').directive('draggable', ['$document', '$window',
function($document, $window) {
  var getEventProp = function(event, prop) {
    if (event[prop] === 0) return 0;
    return event[prop] || (event.touches && event.touches[0][prop]) ||
      (event.originalEvent && event.originalEvent.touches &&
      event.originalEvent.touches[0][prop]);
  };

  return function(scope, element) {
    var position = element.css('position'),
      startX = 0,
      startY = 0,
      x = 0,
      y = 0;

    var mouseMoveHandler = function mouseMoveHandler(event) {
      y = getEventProp(event, 'pageY') - startY;
      x = getEventProp(event, 'pageX') - startX;
      element.css({
        top: y + 'px',
        left: x + 'px'
      });
    };

    var resizeHandler = function resizeHandler() {
      // Always make sure that the element is on the page when it is resized
      var winHeight = angular.element($window).height();
      var winWidth = angular.element($window).width();
      if (winHeight - element.height() < parseInt(element.css('top'), 10)) {
        // We're too short switch to being bottom aligned
        element.css({
          top: 'auto',
          bottom: '10px'
        });
      }
      if (winWidth - element.width() < parseInt(element.css('left'), 10)) {
        // We're too narrow, switch to being right aligned
        element.css({
          left: 'auto',
          right: '10px'
        });
      }
    };

    var mouseUpHandler = function mouseUpHandler() {
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

    element.on('mousedown touchstart', function(event) {
      event.preventDefault();
      var pageX = getEventProp(event, 'pageX');
      var pageY = getEventProp(event, 'pageY');

      switch (position) {
        case 'relative':
          startX = pageX - x;
          startY = pageY - y;
          break;
        case 'absolute':
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
  .directive('muteVideo', function () {
    return {
      restrict: 'E',
      template: '<i class="video-icon ion-ios7-videocam" ' +
      'title="{{mutedVideo ? \'Unmute Video\' : \'Mute Video\'}}"></i>' +
      '<i class="cross-icon" ng-class="' +
      '{\'ion-ios7-checkmark\': mutedVideo, \'ion-ios7-close\': !mutedVideo}" ' +
      'title="{{mutedVideo ? \'Unmute Video\' : \'Mute Video\'}}"' +
      '</i>'
    };
  })
  .directive('muteSubscriber', ['OTSession', function (OTSession) {
    return {
      restrict: 'A',
      link : function(scope, element) {
        var subscriber;
        scope.mutedVideo = false;
        angular.element(element).on('click', function () {
          if (!subscriber) {
            subscriber = OTSession.session.getSubscribersForStream(scope.stream)[0];
          }
          if (subscriber) {
            subscriber.subscribeToVideo(scope.mutedVideo);
            scope.mutedVideo = !scope.mutedVideo;
            scope.$apply();
          }
        });
        scope.$on('$destroy', function () {
          subscriber = null;
        });
      }
    };
  }])
  .directive('mutePublisher', ['OTSession', function (OTSession) {
    return {
      restrict: 'A',
      link : function(scope, element, attrs) {
        var type = attrs.mutedType || 'Video';
        scope['muted' + type] = false;

        var getPublisher = function() {
          return OTSession.publishers.filter(function (el) {
            return el.id === attrs.publisherId;
          })[0];
        };

        angular.element(element).on('click', function () {
          var publisher = getPublisher();
          if (publisher) {
            publisher['publish' + type](scope['muted' + type]);
            scope['muted' + type] = !scope['muted' + type];
            scope.$apply();
          }
        });
        var listenForStreamChanges = function() {
          OTSession.session.addEventListener('streamPropertyChanged', function(event) {
            var publisher = getPublisher();
            if (publisher && publisher.stream &&
            publisher.stream.streamId === event.stream.streamId) {
              scope['muted' + type] = !event.stream['has' + type];
              scope.$apply();
            }
          });
        };
        if (OTSession.session) {
          listenForStreamChanges();
        } else {
          OTSession.on('init', listenForStreamChanges);
        }
      }
    };
  }])
  .directive('restrictFramerate', ['OTSession', function (OTSession) {
    return {
      restrict: 'E',
      template: '<button class="restrict-framerate-btn" ng-class="' +
      '{\'ion-ios7-speedometer-outline\': restrictedFrameRate, ' +
      '\'ion-ios7-speedometer\': !restrictedFrameRate}" title="{{' +
      'restrictedFrameRate ? \'Unrestrict Framerate\' : \'Restrict Framerate\'}}"></button>',
      link: function (scope, element) {
        var subscriber;
        scope.restrictedFrameRate = false;
        angular.element(element).on('click', function () {
          if (!subscriber) {
            subscriber = OTSession.session.getSubscribersForStream(scope.stream)[0];
          }
          if (subscriber) {
            subscriber.restrictFrameRate(!scope.restrictedFrameRate);
            scope.restrictedFrameRate = !scope.restrictedFrameRate;
            scope.$apply();
          }
        });
      }
    };
  }])
  .directive('reconnectingOverlay', ['$interval', function($interval) {
    return {
      restrict: 'E',
      template: '<p>Reconnecting{{ dots }}</p>',
      link: function (scope) {
        var intervalPromise;

        scope.dots = '';

        intervalPromise = $interval(function() {
          scope.dots += '.';

          if (scope.dots.length > 3) {
            scope.dots = '';
          }
        }, 1000);

        scope.$on('$destroy', function() {
          $interval.cancel(intervalPromise);
        });
      }
    };
  }])
  .directive('expandButton', ['$rootScope', function ($rootScope) {
    return {
      restrict: 'E',
      template: '<button class="resize-btn ion-arrow-expand" ng-click="$emit(\'changeSize\');"' +
        ' title="{{expanded ? \'Shrink\' : \'Enlarge\'}}"></button>',
      link: function (scope, element) {
        if (scope.expanded === undefined) {
          // If we're a screen we default to large otherwise we default to small
          scope.expanded = scope.stream.name === 'screen';
        }
        var toggleExpand = function () {
          scope.expanded = !scope.expanded;
          scope.$apply();
          $rootScope.$broadcast('otLayout');
        };
        angular.element(element).on('click', toggleExpand);
        angular.element(element).parent().on('dblclick', toggleExpand);
      }
    };
  }]).directive('zoomButton', ['$rootScope', function ($rootScope) {
    return {
      restrict: 'E',
      scope: {
        zoomed: '='
      },
      template: '<button class="zoom-btn" ng-class="{\'ion-plus-circled\': !zoomed,' +
        ' \'ion-minus-circled\': zoomed}" ' +
        'title="{{zoomed ? \'Zoom Out\' : \'Zoom In\'}}"></button>',
    };
  }]);
