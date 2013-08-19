var express = require("express"),
    fs = require("fs"),
    opentok = require("opentok"),
    moniker = require("moniker"),
    https = require("https"),
    app = express(),
    config,
    rooms = {};

if(process.env.HEROKU) {
    config = {
        "port": process.env.PORT,
        "apiKey": process.env.OT_API_KEY,
        "apiSecret": process.env.OT_API_SECRET
    };
} else {
    try {
        config = JSON.parse(fs.readFileSync("./config.json"));
    } catch(err) {
        console.log("Error reading config.json - have you copied config.json.sample to config.json? ", err);
        process.exit();
    }
}

app.use(express.logger());

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express["static"](__dirname + '/public'));
});

var ot = new opentok.OpenTokSDK(config.apiKey, config.apiSecret);

app.get('/:room', function(req, res) {
    var room = req.params.room,
        goToRoom = function(sessionId) {            
            if (!rooms[room]) rooms[room] = sessionId;
            res.render('room', {
                room: room,
                apiKey: config.apiKey,
                sessionId: rooms[room],
                token: ot.generateToken({sessionId: rooms[room],role: "publisher"})
            });
        };

    if (!rooms[room]) {
        ot.createSession('', {}, goToRoom);
    } else {
        goToRoom(rooms[room]);
    }
});

var generator = moniker.generator([moniker.noun]);

app.get('/', function(req, res) {
    var room = generator.choose();
    res.redirect('/' + room);
});

if(process.env.HEROKU) {
    app.listen(config.port, function() {
        console.log("Listening on " + config.port);
    });
} else {
    https.createServer({key: fs.readFileSync('./server.key', 'utf8'), cert: fs.readFileSync('./server.crt', 'utf8')}, app).listen(config.port);
}