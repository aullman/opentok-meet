// Asynchronous fetching of the room. This is so that the mobile app can use the
// same controller. It doesn't know the room straight away
angular.module('opentok-meet').factory('RoomService', ['$http', 'baseURL', '$window', 'room',
  function ($http, baseURL, $window, room) {
    return {
      getRoom() {
        return $http.get(baseURL + room).then(response => response.data).catch(response => response.data);
      },
      changeRoom() {
        $window.location.href = baseURL;
      },
    };
  },
]);
