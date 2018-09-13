const fs = require('fs');

const OpenTok = require('opentok');
const Sightengine = require('sightengine');

const roomstore = require('./roomstore.js');

module.exports = (app, config, redis, ot, redirectSSL) => {
  const RoomStore = roomstore(redis, ot);
  const sightengine = Sightengine(config.sightengineApiKey, config.sightengineApiSecret);

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

  app.post('/api/imageSafety', (req, res) => {
    if (!req.files || !req.files.media || !req.files.media.path) {
      res.status('500').send('Didn\'t get expected media file');
    }

    const binaryImage = fs.createReadStream(req.files.media.path);

    sightengine.check(['nudity']).set_bytes(binaryImage).then((result) => {
      res.send(String(result.nudity.safe));
    }).catch((err) => {
      res.status('500').send('Got error from sightengine');
      console.log(err);
    });
  });
};
