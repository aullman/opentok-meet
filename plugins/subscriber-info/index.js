const Anvil = require('./anvil');
const roomstore = require('../../server/roomstore.js');

module.exports = (app, config, redis, ot) => {
  const RoomStore = roomstore(redis, ot);
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
        ({ apiKey } = ot);
        secret = ot.apiSecret;
      }

      const payload = {
        apiKey,
        apiSecret: secret,
        sessionId,
        subscriberId,
      };

      anvil.getSubscriberInfo(payload, (getErr, info) => {
        if (getErr) {
          console.error('Error retrieving subscriber information: ', getErr);
          res.send({ error: getErr.message });
          return;
        }

        res.send({ info });
      });
    });
  });
};
