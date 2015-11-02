module.exports = function (app, config, redis, ot) {
  var RoomStore = require('../../server/roomstore.js')(redis, ot);

  function createPinCode(room, callback) {
    var max = 99999;
    var min = 0;
    var pinCode = Math.floor(Math.random() * (max - min + 1)) + min;

    redis.hset('phone_rooms', room, pinCode, function(err) {
      if (err) {
        callback(err);
      }
      redis.hset('phone_pinCodes', pinCode, room, function(err) {
        if (err) {
          callback(err);
        }
        callback(null, pinCode);
      });
    });
  }

  function getPinCode(room, callback) {
    redis.hget('phone_rooms', room, function(err, pinCode) {
      if (err || !pinCode) {
        createPinCode(room, function(err, pinCode) {
          callback(err, pinCode);
        });
      } else {
        callback(null, pinCode);
      }
    });
  }

  function findRoomByPinCode(pinCode, callback) {
    redis.hget('phone_pinCodes', pinCode, function(err, room) {
      if (err || !room) {
        callback(new Error('Not Found'));
        return;
      }
      RoomStore.getRoom(room, callback);
    });
  }

  app.get('/:room/phone', function(req, res) {
    var room = req.param('room');

    getPinCode(room, function(err, pinCode) {
      res.render('phone', {
        room: req.param('room'),
        phoneNumber: config.phoneNumber,
        pinCode: pinCode,
      });
    });
  });

  app.get('/phone/find', function(req, res) {
    var pinCode = req.param('pinCode');
    findRoomByPinCode(pinCode, function(err, sessionId, apiKey, secret) {
      if (err) {
        res.send(404);
        return;
      }
      res.json({
        sessionId: sessionId,
        apiKey: (apiKey && secret) ? apiKey : config.apiKey,
        token: ot.generateToken(sessionId, {
          role: 'publisher'
        })
      });
    });
  });
};
