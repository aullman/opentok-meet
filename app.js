const express = require('express');
const fs = require('fs');
const OpenTok = require('opentok');
const https = require('https');
const compression = require('compression');
const redis = require('redis');
const url = require('url');
const glob = require('glob');
const path = require('path');

const serveStatic = require('serve-static');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
let config;

if (process.env.HEROKU || process.env.TRAVIS) {
  config = {
    port: process.env.PORT,
    apiKey: process.env.OT_API_KEY,
    apiSecret: process.env.OT_API_SECRET,
    chromeExtensionId: process.env.CHROME_EXTENSION_ID,
  };
} else {
  try {
    config = JSON.parse(fs.readFileSync('./config.json'));
  } catch (err) {
    console.log('Error reading config.json - have you copied config.json.sample to config.json? ', err);
    process.exit();
  }
}

let redisClient;
if (process.env.REDISTOGO_URL) {
  const rtg = url.parse(process.env.REDISTOGO_URL);
  redisClient = redis.createClient(rtg.port, rtg.hostname);
  redisClient.auth(rtg.auth.split(':')[1]);
} else {
  redisClient = redis.createClient();
}

app.use(compression());
app.use(morgan());

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(bodyParser());
app.use(methodOverride());

const ot = new OpenTok(config.apiKey, config.apiSecret);
const useSSL = fs.existsSync(`${__dirname}/server.key`) &&
  fs.existsSync(`${__dirname}/server.crt`);

const router = new express.Router();

router.use(serveStatic(`${__dirname}/public`));
require('./server/routes.js')(router, config, redisClient, ot, useSSL || process.env.HEROKU);

app.use('/v1', router);

glob.sync('./plugins/**/*.js').forEach((file) => {
  // eslint-disable-next-line
  require(path.resolve(file))(router, config, redisClient, ot);
});

app.use(serveStatic(`${__dirname}/safe-meet-frontend/dist`));
// default handler...
const defaultContent = fs.readFileSync('./safe-meet-frontend/dist/index.html', 'utf8');
app.use((req, res) => {
  res.send(defaultContent);
});

if (process.env.HEROKU || !useSSL) {
  app.listen(config.port, () => {
    console.log(`Listening on ${config.port}`);
  });
} else {
  https.createServer({
    key: fs.readFileSync('./server.key', 'utf8'),
    cert: fs.readFileSync('./server.crt', 'utf8'),
  }, app).listen(config.port, () => {
    console.log(`Listening on ${config.port}`);
  });
}
