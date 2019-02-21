const push = require('push.js');

angular.module('opentok-meet').factory('Push', () => push);

angular.module('opentok-meet').factory('NotificationService', ['$window', 'OTSession', 'Push',
  function NotificationService($window, OTSession, Push) {
    let focused = true;

    $window.addEventListener('blur', () => {
      focused = false;
    });

    $window.addEventListener('focus', () => {
      focused = true;
    });

    const notifyOnConnectionCreated = () => {
      if (!OTSession.session) {
        OTSession.on('init', notifyOnConnectionCreated);
      } else {
        OTSession.session.on('connectionCreated', (event) => {
          const visible = $window.document.visibilityState === 'visible';
          if ((!focused || !visible) &&
              event.connection.connectionId !== OTSession.session.connection.connectionId) {
            Push.create('New Participant', {
              body: 'Someone joined your meeting',
              icon: '/icon.png',
              tag: 'new-participant',
              timeout: 5000,
              onClick() {
                $window.focus();
                this.close();
              },
            });
          }
        });
      }
    };
    return {
      init() {
        if (Push.Permission.has()) {
          notifyOnConnectionCreated();
        } else {
          try {
            Push.Permission.request(() => {
              notifyOnConnectionCreated();
            }, (err) => {
              console.warn(err);
            });
          } catch (err) {
            console.warn(err);
          }
        }
      },
    };
  },
]);
