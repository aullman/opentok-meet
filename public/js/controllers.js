function RoomCtrl($scope) {
    $scope.publisher;
    $scope.streams;
    $scope.session;
    $scope.sharingMyScreen = false;
    $scope.shareURL = window.location.href;
    var screenPublisher;
    
    $scope.notMine = function(stream) {
        return stream.connection.connectionId != $scope.session.connection.connectionId;
    };
    
    $scope.isBig = function (stream) {
        return stream.name === 'screen';
    };
    
    $scope.shareScreen = function() {
        if (!$scope.sharingMyScreen) {
            $scope.sharingMyScreen = true;
            
            $("layout").append("<div id='myScreen' class='OT_big'></div>");
            
            screenPublisher = TB.initPublisher(1127, 'myScreen', {
                publishAudio: false,
                constraints: {
                    video: {
                        mandatory: {
                            chromeMediaSource: "screen",
                            maxWidth: screen.width,
                            maxHeight: screen.height 
                        },
                        optional: []
                    },
                    audio: false
                },
                name: "screen",
                style: {
                    nameDisplayMode: "off"
                },
                mirror: false,
                width: screen.width,
                height: screen.height,
                aspectRatio: screen.width / screen.height
            }).on("publishError", function (err) {
                $scope.$apply($scope.sharingMyScreen = false);
            });

            $scope.session.publish(screenPublisher);

            screenPublisher.on("loaded", function () {
                $scope.$broadcast("layout");
            });
        }
    };
    
    $scope.hideScreen = function() {
        if ($scope.sharingMyScreen) {
            $scope.sharingMyScreen = false;
            
            $scope.session.unpublish(screenPublisher);
            screenPublisher = null;
            $scope.$broadcast("layout");
        }
    };
    
    $("layout>*.OT_big").live("dblclick", function () {
        $(this).removeClass("OT_big");
        $scope.$broadcast("layout");
    });
    $("layout>*:not(.OT_big)").live("dblclick", function () {
        $(this).addClass("OT_big");
        $scope.$broadcast("layout");
    });
}
