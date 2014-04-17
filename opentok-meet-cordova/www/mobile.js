var otmConfig = {
    room: ''
},
    deferredRoom;

var opentokMeet = angular.module('opentok-meet', ['opentok', 'ngRoute']);

var loadRoom = function () {
    otmConfig.$http.get(otmConfig.baseURL + otmConfig.room)
      .success(function (roomData) {
        deferredRoom.resolve(roomData);
    });
};

// Handle custom URLs
function handleOpenURL(url) {
    otmConfig.room = url.substring('otmeet://'.length);
    
    loadRoom();
}

var OT = {
    $:{},
    onLoad: function (fn) {
        document.addEventListener('deviceReady', fn);
    }
};
OT.$ = window.OTHelpers;

function HomeCtrl($scope, $location) {
    $scope.joinRoom = function () {
        $location.path('/' + $scope.room);
    };
}


opentokMeet.config(['$routeProvider', function($routeProvider) {
      $routeProvider.
          when('/', {templateUrl: 'home.html', controller: HomeCtrl}).
          when('/:room', {templateUrl: 'room.html',   controller: RoomCtrl}).
          otherwise({redirectTo: '/'});
}]);

// Asynchronous fetching of the room, this is different between mobile and web because
// We don't know the room name straight away.
opentokMeet.factory("RoomService", ['$q', '$http', 'baseURL', '$location',
  function ($q, $http, baseURL, $location) {
    return {
        getRoom: function () {
            deferredRoom = $q.defer();
            otmConfig.baseURL = baseURL;
            otmConfig.$http = $http;
            setTimeout(function () {
                if (!otmConfig.room) {
                    otmConfig.room = $location.path().replace('/', '');
                    loadRoom();
                }
            }, 1000);
            return deferredRoom.promise;
        },
        changeRoom: function () {
            $location.path('/');
        }
    };
}]);

opentokMeet.directive('copy', function ($document) {
    return function(scope, element, attrs){
        element.on("click", function (event) {
            event.preventDefault();

            cordova.plugins.clipboard.copy(attrs.copy);
        });
    };
});