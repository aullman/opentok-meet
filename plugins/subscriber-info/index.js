const Anvil = require('./anvil');

module.exports = function (app, config, redis, ot) {
  const RoomStore = require('../../server/roomstore.js')(redis, ot);
  const anvil = new Anvil('https://anvil-tbdev.opentok.com');


  app.get('/:room/subscriber/:subscriberId', (req, res) => {
    const room = req.param('room');
    const subscriberId = req.param('subscriberId');

    RoomStore.getRoom(room, (err, sessionId, apiKey, secret) => {
      if (err) {
        console.error('Error getting room: ', err);
        res.send({ error: err.message });
        return;
      } else if (!apiKey || !secret) {
        apiKey = ot.apiKey;
        secret = ot.apiSecret;
      }

      const payload = {
        apiKey,
        apiSecret: secret,
        sessionId,
        subscriberId,
      };

      anvil.getSubscriberInfo(payload, (err, info) => {
        if (err) {
          console.error('Error retrieving subscriber information: ', err);
          res.send({ error: err.message });
          return;
        }

        res.send({ info });
      });
    });
  });
};
