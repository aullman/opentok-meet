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

if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);
    redis.auth(rtg.auth.split(":")[1]);
} else {
    var redis = require("redis").createClient();
}


app.use(express.logger());

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

var ot = new opentok.OpenTokSDK(config.apiKey, config.apiSecret);

app.get('*', function(req,res,next) {
    if (req.host === 'hangout.tokbox.com') {
        res.redirect('https://meet.tokbox.com' + req.url);
    } else if(req.protocol !== 'https' && req.headers['x-forwarded-proto'] !== 'https') {
        res.redirect('https://' + req.host +req.url);
    } else {
        next();
    }
});

app.get('/rooms', function(req, res) {
    redis.hkeys("rooms", function (err, rooms) {
        res.send(rooms);
    });
});

app.get('/archive/:archiveId', function (req, res) {
    ot.getArchive(req.param('archiveId'), function (err, archive) {
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

var isP2P = function (room) {
    return room.toLowerCase().indexOf('p2p') >= 0;
};

var getRoom = function(room, goToRoom) {
    console.log("getRoom: " + room);
    redis.hget("rooms", room, function (err, sessionId) {
      debugger;
        if (!sessionId) {
            var props = {'p2p.preference': 'disabled'};
            if (isP2P(room)) {
                props['p2p.preference'] = 'enabled';
            }
            ot.createSession('', props, function (err, sessionId) {
                if (err) {
                    goToRoom(err);
                } else {
                    redis.hset("rooms", room, sessionId, function (err) {
                        if (err) {
                            console.error("Failed to set room", err);
                            goToRoom(err);
                        } else {
                            goToRoom(null, sessionId);
                        }
                    });
                }
            });
        } else {
            goToRoom(null, sessionId);
        }
    });
};

app.get('/:room', function(req, res) {
    res.format({
        json: function () {
          debugger;
            var room = req.param('room');
            var goToRoom = function(err, sessionId) {
              debugger;
                if (err) {
                    res.send(err);
                } else {
                    res.set({
                        "Access-Control-Allow-Origin": "*"
                    });
                    res.send({
                        room: room,
                        sessionId: sessionId,
                        apiKey: config.apiKey,
                        p2p: isP2P(room),
                        token: ot.generateToken({
                            sessionId: sessionId,
                            role: "publisher"
                        })
                    });
                }
            };
            getRoom(room, goToRoom);
        },
        html: function () {
            var room = req.param('room'),
                ua = req.headers['user-agent'];
            // If we're on iOS forward them to the iOS App
            if (/like Mac OS X/.test(ua)) {
                var iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
                if (iOS) {
                    res.render('roomiOS', {
                        room: room
                    });
                }
            }
            res.render('room', {
                room: room
            });
        }
    });
});

app.get('/:room/whiteboard', function (req, res) {
    res.render('whiteboard', {
        room: req.param('room')
    });
});

app.get('/:room/archives', function (req, res) {
    redis.smembers("archive_" + req.param('room'), function (err, members) {
        res.send(members);
    });
});

app.post('/:room/startArchive', function (req, res) {
    var room = req.param('room');
    
    getRoom(room, function(err, sessionId) {
        if (err) {
            res.send({
                error: err
            });
        }
        ot.startArchive(sessionId, {
            name: room
        }, function (err, archive) {
            if (err) {
                res.send({
                    error: err
                });
            } else {
                redis.sadd("archive_" + room, archive.id);
                res.send({
                    archiveId: archive.id
                });
            }
        });
    });
});

app.post('/:room/stopArchive', function (req, res) {
    var archiveId = req.param('archiveId');
    
    ot.stopArchive(archiveId, function (err, archive) {
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
});

var generator = moniker.generator([moniker.noun]);

app.get('/', function(req, res) {
    res.render('index.ejs');
});

if(process.env.HEROKU) {
    app.listen(config.port, function() {
        console.log("Listening on " + config.port);
    });
} else {
    https.createServer({key: fs.readFileSync('./server.key', 'utf8'), cert: fs.readFileSync('./server.crt', 'utf8')}, app).listen(config.port, function() {
        console.log("Listening on " + config.port);
    });
}