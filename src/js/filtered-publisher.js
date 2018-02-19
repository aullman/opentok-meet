const filters = require('opentok-camera-filters/src/filters.js');
const filterFn = require('opentok-camera-filters');

angular.module('opentok-meet').directive('filteredPublisher', ['OTSession', '$rootScope',
  (OTSession, $rootScope) => ({
    restrict: 'E',
    scope: {
      props: '&',
    },
    link: (scope, element, attrs) => {
      const props = scope.props() || {};
      props.width = props.width ? props.width : angular.element(element).width();
      props.height = props.height ? props.height : angular.element(element).height();
      const oldChildren = angular.element(element).children();

      if (scope.canvasStream) {
        scope.canvasStream.stop();
      }
      scope.canvasStream = getCanvasStream();
      props.videoSource = scope.canvasStream.canvas.captureStream(30).getVideoTracks()[0];

      scope.publisher = OT.initPublisher(
        attrs.apikey || OTSession.session.apiKey,
        element[0], props, (err) => {
          if (err) {
            scope.$emit('otPublisherError', err, scope.publisher);
          }
        },
      );
      // Make transcluding work manually by putting the children back in there
      angular.element(element).append(oldChildren);
      scope.publisher.on({
        accessDenied() {
          scope.$emit('otAccessDenied');
        },
        accessDialogOpened() {
          scope.$emit('otAccessDialogOpened');
        },
        accessDialogClosed() {
          scope.$emit('otAccessDialogClosed');
        },
        accessAllowed() {
          angular.element(element).addClass('allowed');
          scope.$emit('otAccessAllowed');
        },
        loaded() {
          $rootScope.$broadcast('otLayout');
        },
        streamCreated(event) {
          scope.$emit('otStreamCreated', event);
        },
        streamDestroyed(event) {
          scope.$emit('otStreamDestroyed', event);
        },
        videoElementCreated(event) {
          event.element.addEventListener('resize', () => {
            $rootScope.$broadcast('otLayout');
          });
        },
      });
      scope.$on('$destroy', () => {
        if (OTSession.session) OTSession.session.unpublish(scope.publisher);
        else scope.publisher.destroy();
        if (scope.canvasStream) {
          scope.canvasStream.stop();
        }
        OTSession.publishers = OTSession.publishers.filter(publisher => publisher !== scope.publisher);
        scope.publisher = null;
      });
      if (OTSession.session && (OTSession.session.connected ||
          (OTSession.session.isConnected && OTSession.session.isConnected()))) {
        OTSession.session.publish(scope.publisher, (err) => {
          if (err) {
            scope.$emit('otPublisherError', err, scope.publisher);
          }
        });
      }
      OTSession.addPublisher(scope.publisher);
    },
  }),
]);
