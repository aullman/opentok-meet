var otmConfig = {
    room: ''
},
    deferredRoom;

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

// Asynchronous fetching of the room, this is different between mobile and web because
// We don't know the room name straight away.
opentokMeet.factory("RoomService", ['$q', '$http', 'baseURL', function ($q, $http, baseURL) {
    return function () {
        deferredRoom = $q.defer();
        otmConfig.baseURL = baseURL;
        otmConfig.$http = $http;
        setTimeout(function () {
            if (!otmConfig.room) {
                loadRoom();
            }
        }, 1000);
        return deferredRoom.promise;
    };
}]);