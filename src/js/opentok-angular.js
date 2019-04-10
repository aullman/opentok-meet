/*!
 *  opentok-angular (https://github.com/aullman/OpenTok-Angular)
 *
 *  Angular module for OpenTok
 *
 *  @Author: Adam Ullman (http://github.com/aullman)
 *  @Copyright (c) 2014 Adam Ullman
 *  @License: Released under the MIT license (http://opensource.org/licenses/MIT)
 * */

const ConversationClient = require('nexmo-client'); // eslint-disable-line 

if (!window.OT) throw new Error('You must include the OT library before the OT_Angular library');
let ng;
if (typeof angular === 'undefined' && typeof require !== 'undefined') {
  ng = require('angular');  // eslint-disable-line 
} else {
  ng = angular;
}
let initLayoutContainer;
if (!window.initLayoutContainer && typeof require !== 'undefined') {
  initLayoutContainer = require('opentok-layout-js').initLayoutContainer; // eslint-disable-line 
} else {
  initLayoutContainer = window.initLayoutContainer;
}

ng.module('opentok', [])
  .factory('OT', () => OT)
  .factory('OTSession', ['OT', '$rootScope',
    function OTSessionFn(OT, $rootScope) {
      const OTSession = {
        streams: [],
        connections: [],
        publishers: [],
        init(apiKey, sessionId, token, cb) {
          this.session = OT.initSession(apiKey, sessionId);

          OTSession.session.on({
            sessionConnected() {
              OTSession.publishers.forEach((publisher) => {
                OTSession.session.publish(publisher, (err) => {
                  if (err) {
                    $rootScope.$broadcast('otPublisherError', err, publisher);
                  }
                });
              });
            },
            streamCreated(event) {
              $rootScope.$apply(() => {
                OTSession.streams.push(event.stream);
              });
            },
            streamDestroyed(event) {
              $rootScope.$apply(() => {
                OTSession.streams.splice(OTSession.streams.indexOf(event.stream), 1);
              });
            },
            sessionDisconnected() {
              $rootScope.$apply(() => {
                OTSession.streams.splice(0, OTSession.streams.length);
                OTSession.connections.splice(0, OTSession.connections.length);
              });
            },
            connectionCreated(event) {
              $rootScope.$apply(() => {
                OTSession.connections.push(event.connection);
              });
            },
            connectionDestroyed(event) {
              $rootScope.$apply(() => {
                OTSession.connections.splice(OTSession.connections.indexOf(event.connection), 1);
              });
            },
          });

          this.session.connect(token, (err) => {
            if (cb) cb(err, OTSession.session);
          });
          this.trigger('init');
        },
        addPublisher(publisher) {
          this.publishers.push(publisher);
          this.trigger('otPublisherAdded');
        },
      };
      OT.$.eventing(OTSession);
      return OTSession;
    },
  ])
  .directive('otLayout', ['$window', '$parse', 'OT', 'OTSession',
    function otLayoutFn($window, $parse, OT, OTSession) {
      return {
        restrict: 'E',
        scope: {
          props: '&',
        },
        link(scope, element) {
          const layout = function layout() {
            const props = scope.props() || {};
            const container = initLayoutContainer(element[0], props);
            container.layout();
            scope.$emit('otLayoutComplete');
          };
          scope.$watch(() => element.children().length, layout);
          $window.addEventListener('resize', layout);
          scope.$on('otLayout', layout);
          const listenForStreamChange = function listenForStreamChange() {
            OTSession.session.on('streamPropertyChanged', (event) => {
              if (event.changedProperty === 'videoDimensions') {
                layout();
              }
            });
          };
          if (OTSession.session) listenForStreamChange();
          else OTSession.on('init', listenForStreamChange);
        },
      };
    },
  ])
  .directive('otPublisher', ['OTSession', '$rootScope',
    function otPublisherFn(OTSession, $rootScope) {
      return {
        restrict: 'E',
        scope: {
          props: '&',
        },
        link(scope, element, attrs) {
          const props = scope.props() || {};
          props.width = props.width ? props.width : ng.element(element).width();
          props.height = props.height ? props.height : ng.element(element).height();
          const oldChildren = ng.element(element).children();
          scope.publisher = OT.initPublisher(
            attrs.apikey || OTSession.session.apiKey,
            element[0], props,
            (err) => {
              if (err) {
                scope.$emit('otPublisherError', err, scope.publisher);
              }
            }
          );
          // Make transcluding work manually by putting the children back in there
          ng.element(element).append(oldChildren);
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
              ng.element(element).addClass('allowed');
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
            OTSession.publishers =
              OTSession.publishers.filter(publisher => publisher !== scope.publisher);
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
      };
    },
  ])
  .directive('otSubscriber', ['OTSession', '$rootScope',
    function otSubscriberFn(OTSession, $rootScope) {
      return {
        restrict: 'E',
        scope: {
          stream: '=',
          props: '&',
        },
        link(scope, element) {
          const stream = scope.stream;
          const props = scope.props() || {};
          props.width = props.width ? props.width : ng.element(element).width();
          props.height = props.height ? props.height : ng.element(element).height();
          const oldChildren = ng.element(element).children();
          const subscriber = OTSession.session.subscribe(stream, element[0], props, (err) => {
            if (err) {
              scope.$emit('otSubscriberError', err, subscriber);
            }
          });
          subscriber.on({
            loaded() {
              $rootScope.$broadcast('otLayout');
            },
            videoElementCreated(event) {
              event.element.addEventListener('resize', () => {
                $rootScope.$broadcast('otLayout');
              });
            },
          });
          // Make transcluding work manually by putting the children back in there
          ng.element(element).append(oldChildren);
          scope.$on('$destroy', () => {
            OTSession.session.unsubscribe(subscriber);
          });
        },
      };
    },
  ]);
