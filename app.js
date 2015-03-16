var express = require('express'),
  fs = require('fs'),
  OpenTok = require('opentok'),
  https = require('https'),
  app = express(),
  config;

if (process.env.HEROKU) {
  config = {
    'port': process.env.PORT,
    'apiKey': process.env.OT_API_KEY,
    'apiSecret': process.env.OT_API_SECRET,
    'chromeExtensionId': process.env.CHROME_EXTENSION_ID
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
  var rtg = require('url').parse(process.env.REDISTOGO_URL);
  var redis = require('redis').createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(':')[1]);
} else {
  var redis = require('redis').createClient();
}


app.use(express.logger());

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

var ot = new OpenTok(config.apiKey, config.apiSecret);

require('./server/routes.js')(app, config, redis, ot);

if (process.env.HEROKU) {
  app.listen(config.port, function() {
    console.log('Listening on ' + config.port);
  });
} else {
  https.createServer({
    key: fs.readFileSync('./server.key', 'utf8'),
    cert: fs.readFileSync('./server.crt', 'utf8')
  }, app).listen(config.port, function() {
    console.log('Listening on ' + config.port);
  });
}
