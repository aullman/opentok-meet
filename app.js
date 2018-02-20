let express = require('express'),
  fs = require('fs'),
  OpenTok = require('opentok'),
  https = require('https'),
  compression = require('compression'),
  app = express(),
  config;

if (process.env.HEROKU || process.env.TRAVIS) {
  config = {
    port: process.env.PORT,
    apiKey: process.env.OT_API_KEY,
    apiSecret: process.env.OT_API_SECRET,
    chromeExtensionId: process.env.CHROME_EXTENSION_ID,
    apiUrl: process.env.OT_API_URL || 'https://anvil-tbdev.opentok.com',
    opentokJs: process.env.OT_JS_URL || 'https://tbdev.tokbox.com/v2/js/opentok.js',
  };
} else {
  try {
    config = JSON.parse(fs.readFileSync('./config.json'));
  } catch (err) {
    console.log('Error reading config.json - have you copied config.json.sample to config.json? ',
      err);
    process.exit();
  }
}

if (process.env.REDISTOGO_URL) {
  const rtg = require('url').parse(process.env.REDISTOGO_URL);
  var redis = require('redis').createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(':')[1]);
} else {
  var redis = require('redis').createClient();
}


app.use(compression());
app.use(express.logger());

app.configure(() => {
  app.set('views', `${__dirname}/views`);
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(`${__dirname}/public`));
  app.use(app.router);
});

const ot = new OpenTok(config.apiKey, config.apiSecret, config.apiUrl);
const useSSL = fs.existsSync(`${__dirname}/server.key`) &&
  fs.existsSync(`${__dirname}/server.crt`);

require('./server/routes.js')(app, config, redis, ot, useSSL || process.env.HEROKU);

var glob = require('glob'),
  path = require('path');

glob.sync('./plugins/**/*.js').forEach((file) => {
  require(path.resolve(file))(app, config, redis, ot);
});

var glob = require('glob'),
  path = require('path');

glob.sync('./plugins/**/*.js').forEach((file) => {
  require(path.resolve(file))(app, config, redis, ot);
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
