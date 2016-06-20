angular.module('opentok-meet').directive('draggable', ['$document', function($document) {
  var getEventProp = function(event, prop) {
    if (event[prop] === 0) return 0;
    return event[prop] || (event.touches && event.touches[0][prop]) ||
      (event.originalEvent && event.originalEvent.touches &&
      event.originalEvent.touches[0][prop]);
  };

  return function(scope, element) {
    var mouseMoveHandler = function mouseMoveHandler(event) {
      y = getEventProp(event, 'pageY') - startY;
      x = getEventProp(event, 'pageX') - startX;
      element.css({
        top: y + 'px',
        left: x + 'px'
      });
    };

    var mouseUpHandler = function mouseUpHandler() {
      $document.unbind('mousemove touchmove', mouseMoveHandler);
      $document.unbind('mouseup touchend', mouseUpHandler);
    };

    var position = element.css('position'),
      startX = 0,
      startY = 0,
      x = 0,
      y = 0;
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
      'title="{{muted ? \'Unmute Video\' : \'Mute Video\'}}"></i>' +
      '<i class="cross-icon" ng-class="' +
      '{\'ion-ios7-checkmark\': muted, \'ion-ios7-close\': !muted}" ' +
      'title="{{muted ? \'Unmute Video\' : \'Mute Video\'}}"' +
      '</i>'
    };
  })
  .directive('muteSubscriber', ['OTSession', function (OTSession) {
    return {
      restrict: 'A',
      link : function(scope, element) {
        var subscriber;
        scope.muted = false;
        angular.element(element).on('click', function () {
          if (!subscriber) {
            subscriber = OTSession.session.getSubscribersForStream(scope.stream)[0];
          }
          if (subscriber) {
            subscriber.subscribeToVideo(scope.muted);
            scope.muted = !scope.muted;
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
        var publisher;
        scope.muted = false;
        angular.element(element).on('click', function () {
          if (!publisher) {
            publisher = OTSession.publishers.filter(function (el) {
              return el.id === attrs.publisherId;
            })[0];
          }
          if (publisher) {
            publisher.publishVideo(scope.muted);
            scope.muted = !scope.muted;
            scope.$apply();
          }
        });
        scope.$on('$destroy', function () {
          publisher = null;
        });
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
      link: function (scope, element) {
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
  .directive('expandButton', function () {
    return {
      restrict: 'E',
      template: '<button class="resize-btn ion-arrow-expand" ng-click="$emit(\'changeSize\');"' +
        ' title="{{expanded ? \'Shrink\' : \'Enlarge\'}}"></button>',
      link: function (scope, element) {
        var toggleExpand = function () {
          if (scope.expanded === undefined) {
            // If we're a screen we default to large otherwise we default to small
            scope.expanded = scope.stream.name !== 'screen';
          } else {
            scope.expanded = !scope.expanded;
          }
          scope.$apply();
          scope.$emit('otLayout');
        };
        angular.element(element).on('click', toggleExpand);
        angular.element(element).parent().on('dblclick', toggleExpand);
      }
    };
  });
