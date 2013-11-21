/**
 * OpenTok for AngularJS
 *
 * by: Adam Ullman
 * url: http://aullman.github.com/OpenTok-Angular
 */

if (!window.TB) throw new Error("You must include the TB library before the TB_Angular library");

angular.module('opentok', [])
.directive('session', function() {
    return {
        restrict: 'E',
        scope: {
            apiKey: '@',
            sessionId: '@',
            token: '@',
            session: '=',
            streams: '=',
            publisher: '='
        },
        link: function(scope, element, attrs) {
            var apiKey = attrs.apikey,
                sessionId = attrs.sessionid,
                token = attrs.token;
            scope.streams = [];
            scope.publisher;
            
            $(element).addClass("session-disconnected");

            scope.session = TB.initSession(sessionId);

            var addStreams = function addStreams(streams) {
                scope.$apply(function() {
                    scope.streams = scope.streams.concat(streams);
                });
            };

            var removeStreams = function removeStreams(streams) {
                for (var i = 0; i < streams.length; i++) {
                    for (var j = 0; j < scope.streams.length; j++) {
                        if (streams[i].streamId == scope.streams[j].streamId) {
                            scope.$apply(function() {
                                scope.streams.splice(j, 1);
                            });
                            break;
                        }
                    };
                };
            };

            scope.session.on({
                sessionConnected: function(event) {
                    addStreams(event.streams);
                    if (scope.publisher) scope.session.publish(scope.publisher);
                    $(element).addClass("session-connected");
                    $(element).removeClass("session-disconnected");
                },
                streamCreated: function(event) {
                    addStreams(event.streams);
                },
                streamDestroyed: function(event) {
                    removeStreams(event.streams);
                },
                sessionDisconnected: function(event) {
                    scope.$apply(function() {
                        scope.streams = [];
                    });
                    $(element).addClass("session-disconnected");
                    $(element).removeClass("session-connected");
                }
            });

            scope.notMine = function(stream) {
                return stream.connection.connectionId != scope.session.connection.connectionId;
            };

            scope.session.connect(apiKey, token);
        }
    };
})
.directive('layout', function($window, $parse) {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            var props = $parse(attrs.props)();
            var container = TB.initLayoutContainer(element[0], props);
            scope.$watch(function() {
                return element.children().length;
            }, container.layout);
            $window.addEventListener("resize", container.layout);
            scope.$on("layout", function() {
                container.layout();
            });
        }
    };
})
.directive('publisher', function() {
    return {
        restrict: 'E',
        scope: {
            props: '&',
            publisher: '='
        },
        link: function(scope, element, attrs){
            $(element).attr("id", "publisher");
            var props = scope.props() || {};
            props.width = props.width ? props.width : $(element).width();
            props.height = props.height ? props.height : $(element).height();
            scope.publisher = TB.initPublisher(attrs.apikey, 'publisher', props);
            scope.publisher.on({
                accessAllowed: function(event) {
                    $(element).addClass("allowed");
                },
                loaded: function () {
                    // Tell any layout containers around us to layout again (now that we know our ratio)
                    scope.$emit("layout");
                }
            });
            scope.$on("$destroy", function () {
                scope.publisher.destroy();
            });
        }
    };
})
.directive('subscriber', function() {
    return {
        restrict: 'E',
        scope: {
            stream: '=',
            session: "=",
            props: '&'
        },
        link: function(scope, element, attrs){
            var stream = scope.stream,
                session = scope.session,
                props = scope.props() || {};
            props.width = props.width ? props.width : $(element).width();
            props.height = props.height ? props.height : $(element).height();
            $(element).attr("id", stream.streamId);
            var subscriber = session.subscribe(stream, stream.streamId, props);
            subscriber.on("loaded", function () {
                // Tell any layout containers around us to layout again (now that we know our ratio)
                scope.$emit("layout");
            });
            scope.$on("$destroy", function () {
                subscriber.destroy();
            });
        }
    };
});