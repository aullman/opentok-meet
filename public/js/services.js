// Asynchronous fetching of the room. This is so that the mobile app can use the
// same controller. It doesn't know the room straight away
opentokMeet.factory("RoomService", ['$q', '$http', 'baseURL', 'room', function ($q, $http, baseURL, room) {
    return function () {
        var deferred = $q.defer();
        $http.get(baseURL + room + '.json').success(function (roomData) {
            deferred.resolve(roomData);
        });
        return deferred.promise;
    };
}]);