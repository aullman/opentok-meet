// Asynchronous fetching of the room. This is so that the mobile app can use the
// same controller. It doesn't know the room straight away
angular.module('opentok-meet').factory('RoomService', ['$http', 'baseURL', '$window', 'room',
  function($http, baseURL, $window, room) {
    return {
      getRoom: function() {
        return $http.get(baseURL + room).then(function(response) {
          return response.data;
        }).catch(function(response) {
          return response.data;
        });
      },
      changeRoom: function() {
        $window.location.href = baseURL;
      }
    };
  }
]);
