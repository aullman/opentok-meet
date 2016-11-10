var OpenTok = require('opentok');

module.exports = function (app, config, redis, ot) {
  var RoomStore = require('../../server/roomstore.js')(redis, ot);

  // Keeping this around for legacy URLs. The new URL format for
  // archives is /:room/archive/:archiveId though
  app.get('/archive/:archiveId', function(req, res) {
    ot.getArchive(req.param('archiveId'), function(err, archive) {
      if (err) {
        res.send(404, err.message);
      } else {
        res.render('archive', {
          name: archive.name,
          url: archive.url
        });
      }
    });
  });

  app.get('/:room/archive/:archiveId', function(req, res) {
    var room = req.param('room');
    redis.hget('apiKeys', room, function(err, apiKeySecret) {
      if (err) {
        res.send(404, err.message);
      } else {
        var otSDK = ot;
        if (apiKeySecret) {
          apiKeySecret = JSON.parse(apiKeySecret);
          otSDK = new OpenTok(apiKeySecret.apiKey, apiKeySecret.secret);
        }
        otSDK.getArchive(req.param('archiveId'), function(err, archive) {
          if (err) {
            res.send(404, err.message);
          } else {
            res.render('archive', {
              name: archive.name,
              url: archive.url,
              status: archive.status
            });
          }
        });
      }
    });
  });

  app.get('/:room/archives', function(req, res) {
    redis.smembers('archive_' + req.param('room'), function(err, members) {
      res.send(members);
    });
  });

  app.post('/:room/startArchive', function(req, res) {
    var room = req.param('room');

    RoomStore.getRoom(room, function(err, sessionId, apiKey, secret) {
      if (err) {
        console.error('Error getting room: ', err);
        res.send({
          error: err.message
        });
      }
      var otSDK = ot;
      if (apiKey && secret) {
        otSDK = new OpenTok(apiKey, secret);
      }
      otSDK.startArchive(sessionId, {
        name: room
      }, function(err, archive) {
        if (err) {
          console.error('Error starting archive: ', err);
          res.send({
            error: err.message
          });
        } else {
          redis.sadd('archive_' + room, archive.id);
          res.send({
            archiveId: archive.id
          });
        }
      });
    });
  });

  app.post('/:room/stopArchive', function(req, res) {
    var archiveId = req.param('archiveId'),
      room = req.param('room');

    // Lookup if there's a custom apiKey for this room
    redis.hget('apiKeys', room, function(err, apiKeySecret) {
      if (err) {
        console.error('Error getting apiKeys: ', err);
        res.send({
          error: err.message
        });
      } else {
        var otSDK = ot;
        if (apiKeySecret) {
          apiKeySecret = JSON.parse(apiKeySecret);
          otSDK = new OpenTok(apiKeySecret.apiKey, apiKeySecret.secret);
        }

        otSDK.stopArchive(archiveId, function(err, archive) {
          if (err) {
            console.error('Error stopping archive: ', err);
            res.send({
              error: err.message
            });
          } else {
            res.send({
              archiveId: archive.id
            });
          }
        });
      }
    });
  });
};
