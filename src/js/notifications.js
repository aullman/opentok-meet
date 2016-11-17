var Push = require('push.js');

angular.module('opentok-meet').factory('Push', function() {
  return Push;
});

angular.module('opentok-meet').factory('NotificationService', ['$window', 'OTSession', 'Push',
  function($window, OTSession, Push) {
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
        OTSession.session.on('connectionCreated', function(event) {
          if (!focused &&
              event.connection.connectionId !== OTSession.session.connection.connectionId) {
            Push.create('New Participant', {
              body: 'Someone joined your meeting',
              icon: '/icon.png',
              tag: 'new-participant',
              timeout: 5000,
              onClick: function () {
                $window.focus();
                this.close();
              }
            });
          }
        });
      }
    };
    return {
      init: function() {
        if (Push.Permission.has()) {
          notifyOnConnectionCreated();
        } else {
          try {
            Push.Permission.request(function() {
                notifyOnConnectionCreated();
            }, function(err) {
              console.warn(err);
            });
          } catch(err) {
            console.warn(err);
          }
        }
      }
    };
  }
]);
