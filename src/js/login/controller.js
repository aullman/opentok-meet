var isp2p = function (room) {
  return room && room.toLowerCase().indexOf('p2p') > -1;
};

angular.module('opentok-meet-login', [])
  .controller('MainCtrl', ['$scope', '$window', function($scope, $window) {
    $scope.room = '';
    $scope.joinRoom = function() {
      $window.location.href = $window.location.href + encodeURIComponent($scope.room);
    };
    $scope.p2p = false;
    $scope.$watch('room', function(room) {
      $scope.p2p = isp2p(room);
    });
    $scope.p2pChanged = function () {
      if ($scope.p2p && !isp2p($scope.room)) {
        $scope.room += 'p2p';
      } else if (!$scope.p2p) {
        $scope.room = $scope.room.replace('p2p', '');
      }
    };
  }]);
