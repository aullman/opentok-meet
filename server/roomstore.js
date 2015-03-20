var OpenTok = require('opentok');

module.exports = function(redis, ot) {
  var roomStore = {
    isP2P: function (room) {
      return room.toLowerCase().indexOf('p2p') >= 0;
    },
    getRooms: function(callback) {
      redis.hkeys('rooms', callback);
    },
    getRoom: function(room, apiKey, secret, goToRoom) {
      console.log('getRoom: ' + room + ' ' + apiKey + ' ' + secret);
      goToRoom = arguments[arguments.length - 1];
      // Lookup the mapping of rooms to sessionIds
      redis.hget('rooms', room, function(err, sessionId) {
        if (!sessionId) {
          var props = {
            mediaMode: 'routed'
          };
          if (roomStore.isP2P(room)) {
            props.mediaMode = 'relayed';
          }
          var otSDK = ot;
          // If there's a custom apiKey and secret use that
          if (apiKey && secret) {
            otSDK = new OpenTok(apiKey, secret);
          }
          // Create the session
          otSDK.createSession(props, function(err, session) {
            if (err) {
              goToRoom(err);
            } else {
              var sessionId = session.sessionId;
              // Store the room to sessionId mapping
              redis.hset('rooms', room, sessionId, function(err) {
                if (err) {
                  console.error('Failed to set room', err);
                  goToRoom(err);
                } else {
                  if (apiKey && secret) {
                    // If there's a custom apiKey and secret store that
                    redis.hset('apiKeys', room, JSON.stringify({
                        apiKey: apiKey,
                        secret: secret
                      }),
                      function(err) {
                        if (err) {
                          console.error('Failed to set apiKey', err);
                          goToRoom(err);
                        } else {
                          goToRoom(null, sessionId, apiKey, secret);
                        }
                      });
                  } else {
                    goToRoom(null, sessionId);
                  }
                }
              });
            }
          });
        } else {
          // Lookup if there's a custom apiKey for this room
          redis.hget('apiKeys', room, function(err, apiKeySecret) {
            if (err || !apiKeySecret) {
              goToRoom(null, sessionId);
            } else {
              apiKeySecret = JSON.parse(apiKeySecret);
              goToRoom(null, sessionId, apiKeySecret.apiKey, apiKeySecret.secret);
            }
          });
        }
      });
    }
  };
  return roomStore;
};
