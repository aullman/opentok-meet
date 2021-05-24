const isValidTokenRole = require('../isValidTokenRole');
const isp2p = room => room && room.toLowerCase().indexOf('p2p') > -1;

angular.module('opentok-meet-login', [])
  .controller('MainCtrl', ['$scope', '$window', function MainCtrl($scope, $window) {
    $scope.room = '';
    $scope.roomType = 'normal';
    $scope.tokenRole = 'moderator';
    $scope.advanced = false;
    $scope.dtx = false;
    $scope.joinRoom = () => {
      let url = $window.location.href + encodeURIComponent($scope.room);

      if ($scope.roomType !== 'normal') {
        url += `/${$scope.roomType}`;
      }

      if (!isValidTokenRole($scope.tokenRole)) {
        $scope.tokenRole = 'moderator';
      }

      if ($scope.tokenRole) {
        url += `?tokenRole=${$scope.tokenRole}`;
      }

      if ($scope.dtx) {
        const precursor = $scope.tokenRole ? '&' : '?';
        url += `${precursor}dtx=true`;
      }

      $window.location.href = url;
    };
    $scope.p2p = false;
    $scope.$watch('room', (room) => {
      $scope.p2p = isp2p(room);
    });
    $scope.p2pChanged = () => {
      if ($scope.p2p && !isp2p($scope.room)) {
        $scope.room += 'p2p';
      } else if (!$scope.p2p) {
        $scope.room = $scope.room.replace('p2p', '');
      }
    };
  }]);
