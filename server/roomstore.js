const OpenTok = require('opentok');

module.exports = function (redis, ot) {
  var roomStore = {
    isP2P(room) {
      return room.toLowerCase().indexOf('p2p') >= 0;
    },
    getRooms(callback) {
      redis.hkeys('rooms', callback);
    },
    clearRooms(callback) {
      // This deletes all of the rooms. Only use this when migrating to
      // a different environment
      redis.del('rooms', callback);
    },
    getRoom(room, apiKey, secret, goToRoom) {
      console.log(`getRoom: ${room}`);
      goToRoom = arguments[arguments.length - 1];
      // Lookup the mapping of rooms to sessionIds
      redis.hget('rooms', room, (err, sessionId) => {
        if (!sessionId) {
          const props = {
            mediaMode: 'routed',
          };
          if (roomStore.isP2P(room)) {
            props.mediaMode = 'relayed';
          }
          let otSDK = ot;
          // If there's a custom apiKey and secret use that
          if (apiKey && secret) {
            otSDK = new OpenTok(apiKey, secret);
          }
          // Create the session
          otSDK.createSession(props, (err, session) => {
            if (err) {
              goToRoom(err);
            } else {
              const sessionId = session.sessionId;
              // Store the room to sessionId mapping
              redis.hset('rooms', room, sessionId, (err) => {
                if (err) {
                  console.error('Failed to set room', err);
                  goToRoom(err);
                } else if (apiKey && secret) {
                    // If there's a custom apiKey and secret store that
                  redis.hset('apiKeys', room, JSON.stringify({
                    apiKey,
                    secret,
                  }),
                      (err) => {
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
              });
            }
          });
        } else {
          // Lookup if there's a custom apiKey for this room
          redis.hget('apiKeys', room, (err, apiKeySecret) => {
            if (err || !apiKeySecret) {
              goToRoom(null, sessionId);
            } else {
              apiKeySecret = JSON.parse(apiKeySecret);
              goToRoom(null, sessionId, apiKeySecret.apiKey, apiKeySecret.secret);
            }
          });
        }
      });
    },
  };
  return roomStore;
};
