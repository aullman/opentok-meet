var Anvil = require('./anvil');

module.exports = function (app, config, redis, ot) {
  var RoomStore = require('../../server/roomstore.js')(redis, ot);
  var anvil = new Anvil('https://anvil-tbdev.opentok.com');


  app.get('/:room/subscriber/:subscriberId', function(req, res) {
    var room = req.param('room');
    var subscriberId = req.param('subscriberId');

    RoomStore.getRoom(room, function(err, sessionId, apiKey, secret) {
      if (err) {
        console.error('Error getting room: ', err);
        res.send({ error: err.message });
        return;
      } else if(!apiKey || !secret) {
        apiKey = ot.apiKey;
        secret = ot.apiSecret;
      }

      var payload = {
        apiKey: apiKey,
        apiSecret: secret,
        sessionId: sessionId,
        subscriberId: subscriberId
      };

      anvil.getSubscriberInfo(payload, function(err, info) {
        if (err) {
          console.error('Error retrieving subscriber information: ', err);
          res.send({ error: err.message });
          return;
        }

        res.send({info: info});
      });
    });
  });
};
