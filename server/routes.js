var OpenTok = require('opentok');

module.exports = function (app, config, redis, ot) {
  var RoomStore = require('./roomstore.js')(redis, ot);
  app.get('*', function(req, res, next) {
    if (req.host === 'hangout.tokbox.com') {
      res.redirect('https://meet.tokbox.com' + req.url);
    } else if (req.protocol !== 'https' && req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect('https://' + req.host + req.url);
    } else {
      next();
    }
  });

  app.get('/rooms', function(req, res) {
    RoomStore.getRooms(function (err, rooms) {
      res.send(rooms);
    });
  });

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

  // To set a custom APIKey and Secret for a particular room you can make a CURL request with
  // apiKey and secret params. eg. 
  // curl -k https://localhost:5000/customKey -d "apiKey=APIKEY&secret=SECRET" -X "GET"
  // This room has to not already exist though.
  app.get('/:room', function(req, res) {
    var room = req.param('room'),
      apiKey = req.param('apiKey'),
      secret = req.param('secret');
    res.format({
      json: function() {
        var goToRoom = function(err, sessionId, apiKey, secret) {
          if (err) {
            res.send(err);
          } else {
            res.set({
              'Access-Control-Allow-Origin': '*'
            });
            var otSDK = ot;
            if (apiKey && secret) {
              otSDK = new OpenTok(apiKey, secret);
            }
            res.send({
              room: room,
              sessionId: sessionId,
              apiKey: (apiKey && secret) ? apiKey : config.apiKey,
              p2p: RoomStore.isP2P(room),
              token: otSDK.generateToken(sessionId, {
                role: 'publisher'
              })
            });
          }
        };
        RoomStore.getRoom(room, apiKey, secret, goToRoom);
      },
      html: function() {
        var ua = req.headers['user-agent'];
        // If we're on iOS forward them to the iOS App
        if (/like Mac OS X/.test(ua)) {
          var iOSRegex = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua),
            iOS = iOSRegex && iOSRegex.length > 2 && iOSRegex[2].replace(/_/g, '.');
          if (iOS) {
            res.render('roomiOS', {
              room: room
            });
          }
        }
        res.render('room', {
          room: room,
          chromeExtensionId: config.chromeExtensionId
        });
      }
    });
  });

  app.get('/:room/whiteboard', function(req, res) {
    res.render('whiteboard', {
      room: req.param('room')
    });
  });

  app.get('/:room/screen', function(req, res) {
    res.render('screen', {
      room: req.param('room'),
      chromeExtensionId: config.chromeExtensionId
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
        res.send({
          error: err
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
          res.send({
            error: err
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
        res.send({
          error: err
        });
      } else {
        var otSDK = ot;
        if (apiKeySecret) {
          apiKeySecret = JSON.parse(apiKeySecret);
          otSDK = new OpenTok(apiKeySecret.apiKey, apiKeySecret.secret);
        }

        otSDK.stopArchive(archiveId, function(err, archive) {
          if (err) {
            res.send({
              error: err
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

  app.get('/', function(req, res) {
    res.render('index.ejs');
  });
};