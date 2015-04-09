angular.module('opentok-meet').directive('draggable', function($document) {
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
})
  .directive('muteVideo', function () {
    return {
      restrict: 'E',
      scope: {
        muted: '='
      },
      template: '<i class="video-icon ion-ios7-videocam" ' +
      'title="{{muted ? \'Unmute Video\' : \'Mute Video\'}}"></i>' +
      '<i class="cross-icon" ng-class="' +
      '{\'ion-ios7-checkmark\': muted, \'ion-ios7-close\': !muted}" ' +
      'title="{{muted ? \'Unmute Video\' : \'Mute Video\'}}"' +
      '</i>'
    };
  });
