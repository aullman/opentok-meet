// Asynchronous fetching of the room. This is so that the mobile app can use the
// same controller. It doesn't know the room straight away
opentokMeet.factory('RoomService', ['$q', '$http', 'baseURL', '$window', 'room',
  function($q, $http, baseURL, $window, room) {
    return {
      getRoom: function() {
        var deferred = $q.defer();
        $http.get(baseURL + room).success(function(roomData) {
          deferred.resolve(roomData);
        });
        return deferred.promise;
      },
      changeRoom: function() {
        $window.location.href = baseURL;
      }
    };
  }
]);
