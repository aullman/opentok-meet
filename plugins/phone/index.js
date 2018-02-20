const roomstore = require('../../server/roomstore.js');

module.exports = (app, config, redis, ot) => {
  const RoomStore = roomstore(redis, ot);

  function createPinCode(room, callback) {
    const max = 99999;
    const min = 0;
    const pinCode = Math.floor(Math.random() * ((max - min) + 1)) + min;

    redis.hset('phone_rooms', room, pinCode, (err) => {
      if (err) {
        callback(err);
      }
      redis.hset('phone_pinCodes', pinCode, room, (setErr) => {
        if (setErr) {
          callback(setErr);
        }
        callback(null, pinCode);
      });
    });
  }

  function getPinCode(room, callback) {
    redis.hget('phone_rooms', room, (err, pinCode) => {
      if (err || !pinCode) {
        createPinCode(room, (createErr, newPinCode) => {
          callback(createErr, newPinCode);
        });
      } else {
        callback(null, pinCode);
      }
    });
  }

  function findRoomByPinCode(pinCode, callback) {
    redis.hget('phone_pinCodes', pinCode, (err, room) => {
      if (err || !room) {
        callback(new Error('Not Found'));
        return;
      }
      RoomStore.getRoom(room, callback);
    });
  }

  app.get('/:room/phone', (req, res) => {
    const room = req.param('room');

    getPinCode(room, (err, pinCode) => {
      res.render('phone', {
        room: req.param('room'),
        phoneNumber: config.phoneNumber || process.env.PHONE_NUMBER,
        pinCode,
      });
    });
  });

  app.get('/phone/find', (req, res) => {
    const pinCode = req.param('pinCode');
    findRoomByPinCode(pinCode, (err, sessionId, apiKey, secret) => {
      if (err) {
        res.send(404);
        return;
      }
      res.json({
        sessionId,
        apiKey: (apiKey && secret) ? apiKey : config.apiKey,
        token: ot.generateToken(sessionId, {
          role: 'publisher',
        }),
      });
    });
  });
};
