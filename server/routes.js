const OpenTok = require('opentok');
const roomstore = require('./roomstore.js');

module.exports = (app, config, redis, ot, redirectSSL) => {
  const RoomStore = roomstore(redis, ot);
  app.get('*', (req, res, next) => {
    if (req.hostname === 'hangout.tokbox.com') {
      res.redirect(`https://meet.tokbox.com${req.url}`);
    } else if (redirectSSL && req.protocol !== 'https' &&
      req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect(`https://${req.hostname}${req.url}`);
    } else {
      next();
    }
  });

  app.get('/rooms', (req, res) => {
    RoomStore.getRooms((err, rooms) => {
      res.send(rooms);
    });
  });

  // To set a custom APIKey and Secret for a particular room you can make a CURL request with
  // apiKey and secret params. eg.
  // curl -k https://localhost:5000/customKey -d "apiKey=APIKEY&secret=SECRET" -X "GET"
  // This room has to not already exist though.
  app.get('/:room', (req, res) => {
    const room = req.param('room');
    const apiKey = req.param('apiKey');
    const secret = req.param('secret');
    res.format({
      json() {
        const goToRoom = (err, sessionId, pApiKey, pSecret) => {
          if (err) {
            console.error('Error getting room: ', err);
            res.send({
              error: err.message,
            });
          } else {
            res.set({
              'Access-Control-Allow-Origin': '*',
            });
            let otSDK = ot;
            if (pApiKey && pSecret) {
              otSDK = new OpenTok(pApiKey, pSecret);
            }
            res.send({
              room,
              sessionId,
              apiKey: (pApiKey && pSecret) ? pApiKey : config.apiKey,
              p2p: RoomStore.isP2P(room),
              token: otSDK.generateToken(sessionId, {
                role: 'publisher',
              }),
            });
          }
        };
        RoomStore.getRoom(room, apiKey, secret, goToRoom);
      },
      html() {
        res.render('room', {
          room,
          chromeExtensionId: config.chromeExtensionId,
        });
      },
    });
  });

  app.get('/', (req, res) => {
    res.render('index.ejs');
  });
};
