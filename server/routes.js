var OpenTok = require('opentok');

module.exports = function (app, config, redis, ot, redirectSSL) {
  var RoomStore = require('./roomstore.js')(redis, ot);
  app.get('*', function(req, res, next) {
    if (req.host === 'hangout.tokbox.com') {
      res.redirect('https://meet.tokbox.com' + req.url);
    } else if (redirectSSL && req.protocol !== 'https' &&
      req.headers['x-forwarded-proto'] !== 'https') {
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
            console.error('Error getting room: ', err);
            res.send({
              error: err.message
            });
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
            return;
          }
        }
        res.render('room', {
          room: room,
          chromeExtensionId: config.chromeExtensionId
        });
      }
    });
  });

  app.get('/', function(req, res) {
    res.render('index.ejs');
  });
};
