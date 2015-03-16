var opentokMeet = angular.module('opentok-meet', ['opentok', 'ngRoute']);

// Handle custom URLs
/*jshint unused:false*/
function handleOpenURL(url) {
  // Go to /:room and let the route provider handle it
  window.location.hash = '#/' + url.substring('otmeet://'.length);
}
/*jshint unused:true*/

if (!OT) {
  var OT = {};
}
OT.onLoad = function(fn) {
  document.addEventListener('deviceReady', fn);
};
OT.$ = OT.getHelper();

function HomeCtrl($scope, $location) {
  $scope.joinRoom = function() {
    $location.path('/' + $scope.room);
  };
}


opentokMeet.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/', {
      templateUrl: 'home.html',
      controller: HomeCtrl
    }).
    when('/:room', {
      templateUrl: 'room.html',
      controller: 'RoomCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });
  }
]);

// Asynchronous fetching of the room, this is different between mobile and web because
// We don't know the room name straight away.
opentokMeet.factory('RoomService', ['$q', '$http', 'baseURL', '$location',
  function($q, $http, baseURL, $location) {
    return {
      getRoom: function() {
        var deferredRoom = $q.defer();
        var room = $location.path().replace('/', '');

        $http.get(baseURL + room)
          .success(function(roomData) {
            deferredRoom.resolve(roomData);
          });

        return deferredRoom.promise;
      },
      changeRoom: function() {
        $location.path('/');
      }
    };
  }
]);

opentokMeet.directive('copy', function() {
  return function(scope, element, attrs) {
    element.on('click', function(event) {
      event.preventDefault();

      cordova.plugins.clipboard.copy(attrs.copy);
    });
  };
});
