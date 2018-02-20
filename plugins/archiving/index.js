const OpenTok = require('opentok');
const roomstore = require('../../server/roomstore.js');

module.exports = (app, config, redis, ot) => {
  const RoomStore = roomstore(redis, ot);

  // Keeping this around for legacy URLs. The new URL format for
  // archives is /:room/archive/:archiveId though
  app.get('/archive/:archiveId', (req, res) => {
    ot.getArchive(req.param('archiveId'), (err, archive) => {
      if (err) {
        res.send(404, err.message);
      } else {
        res.render('archive', {
          name: archive.name,
          url: archive.url,
        });
      }
    });
  });

  app.get('/:room/archive/:archiveId', (req, res) => {
    const room = req.param('room');
    redis.hget('apiKeys', room, (err, apiKeySecret) => {
      if (err) {
        res.send(404, err.message);
      } else {
        let otSDK = ot;
        if (apiKeySecret) {
          apiKeySecret = JSON.parse(apiKeySecret);
          otSDK = new OpenTok(apiKeySecret.apiKey, apiKeySecret.secret,
            'https://anvil-tbdev.opentok.com');
        }
        otSDK.getArchive(req.param('archiveId'), (archiveErr, archive) => {
          if (archiveErr) {
            res.send(404, archiveErr.message);
          } else {
            res.render('archive', {
              name: archive.name,
              url: archive.url,
              status: archive.status,
            });
          }
        });
      }
    });
  });

  app.get('/:room/archives', (req, res) => {
    redis.smembers(`archive_${req.param('room')}`, (err, members) => {
      res.send(members);
    });
  });

  app.post('/:room/startArchive', (req, res) => {
    const room = req.param('room');

    RoomStore.getRoom(room, (err, sessionId, apiKey, secret) => {
      if (err) {
        console.error('Error getting room: ', err);
        res.send({
          error: err.message,
        });
      }
      let otSDK = ot;
      if (apiKey && secret) {
        otSDK = new OpenTok(apiKey, secret, 'https://anvil-tbdev.opentok.com');
      }
      otSDK.startArchive(sessionId, {
        name: room,
      }, (startErr, archive) => {
        if (startErr) {
          console.error('Error starting archive: ', startErr);
          res.send({
            error: startErr.message,
          });
        } else {
          redis.sadd(`archive_${room}`, archive.id);
          res.send({
            archiveId: archive.id,
          });
        }
      });
    });
  });

  app.post('/:room/stopArchive', (req, res) => {
    const archiveId = req.param('archiveId');
    const room = req.param('room');

    // Lookup if there's a custom apiKey for this room
    redis.hget('apiKeys', room, (err, apiKeySecret) => {
      if (err) {
        console.error('Error getting apiKeys: ', err);
        res.send({
          error: err.message,
        });
      } else {
        let otSDK = ot;
        if (apiKeySecret) {
          apiKeySecret = JSON.parse(apiKeySecret);
          otSDK = new OpenTok(apiKeySecret.apiKey, apiKeySecret.secret,
            'https://anvil-tbdev.opentok.com');
        }

        otSDK.stopArchive(archiveId, (stopErr, archive) => {
          if (stopErr) {
            console.error('Error stopping archive: ', stopErr);
            res.send({
              error: stopErr.message,
            });
          } else {
            res.send({
              archiveId: archive.id,
            });
          }
        });
      }
    });
  });
};
