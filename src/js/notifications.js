angular.module('opentok-meet').factory('NotificationService', ['$window', 'OTSession',
  function($window, OTSession) {
    var focused = true;

    $window.addEventListener('blur', function() {
      focused = false;
    });

    $window.addEventListener('focus', function() {
      focused = true;
    });

    var notifyOnConnectionCreated = function() {
      if (!OTSession.session) {
        OTSession.on('init', notifyOnConnectionCreated);
      } else {
        OTSession.session.on('connectionCreated', function() {
          if (!focused) {
            new $window.Notification('New Participant', {
              body: 'Someone joined your meeting',
              icon: '/icon.png'
            });
          }
        });
      }
    };
    return {
      init: function() {
        if ($window.hasOwnProperty('Notification')) {
          var Notification = $window.Notification;
          if (Notification.permission === 'granted') {
            notifyOnConnectionCreated();
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function(permission) {
              if (permission === 'granted') {
                notifyOnConnectionCreated();
              }
            });
          }
        }
      }
    };
  }
]);
