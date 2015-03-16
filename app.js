var express = require("express"),
    fs = require("fs"),
    OpenTok = require("opentok"),
    https = require("https"),
    app = express(),
    config;

if(process.env.HEROKU) {
    config = {
        "port": process.env.PORT,
        "apiKey": process.env.OT_API_KEY,
        "apiSecret": process.env.OT_API_SECRET,
        "chromeExtensionId": process.env.CHROME_EXTENSION_ID
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

var ot = new OpenTok(config.apiKey, config.apiSecret);

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

// Keeping this around for legacy URLs. The new URL format for
// archives is /:room/archive/:archiveId though
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

app.get('/:room/archive/:archiveId', function (req, res) {
    var room = req.param('room');
    redis.hget("apiKeys", room, function (err, apiKeySecret) {
        if (err) {
            res.send(404, err.message);
        } else {
            var otSDK = ot;
            if (apiKeySecret) {
                apiKeySecret = JSON.parse(apiKeySecret);
                otSDK = new OpenTok(apiKeySecret.apiKey, apiKeySecret.secret);
            }
            otSDK.getArchive(req.param('archiveId'), function (err, archive) {
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

var isP2P = function (room) {
    return room.toLowerCase().indexOf('p2p') >= 0;
};

var getRoom = function(room, apiKey, secret, goToRoom) {
    console.log("getRoom: " + room + " " + apiKey + " " + secret);
    goToRoom = arguments[arguments.length-1];
    // Lookup the mapping of rooms to sessionIds
    redis.hget("rooms", room, function (err, sessionId) {
        if (!sessionId) {
            var props = {mediaMode: 'routed'};
            if (isP2P(room)) {
                props.mediaMode = 'relayed';
            }
            var otSDK = ot;
            // If there's a custom apiKey and secret use that
            if (apiKey && secret) {
              otSDK = new OpenTok(apiKey, secret);
            }
            // Create the session
            otSDK.createSession(props, function (err, session) {
                if (err) {
                    goToRoom(err);
                } else {
                    var sessionId = session.sessionId;
                    // Store the room to sessionId mapping
                    redis.hset("rooms", room, sessionId, function (err) {
                        if (err) {
                            console.error("Failed to set room", err);
                            goToRoom(err);
                        } else {
                            if (apiKey && secret) {
                                // If there's a custom apiKey and secret store that
                                redis.hset("apiKeys", room, JSON.stringify({apiKey: apiKey, secret: secret}),
                                    function (err) {
                                        if (err) {
                                            console.error("Failed to set apiKey", err);
                                            goToRoom(err);
                                        } else {
                                            goToRoom(null, sessionId, apiKey, secret);
                                        }
                                    });
                            } else {
                                goToRoom(null, sessionId);
                            }
                        }
                    });
                }
            });
        } else {
            // Lookup if there's a custom apiKey for this room
            redis.hget("apiKeys", room, function (err, apiKeySecret) {
                if (err || !apiKeySecret) {
                    goToRoom(null, sessionId);
                } else {
                    apiKeySecret = JSON.parse(apiKeySecret);
                    goToRoom(null, sessionId, apiKeySecret.apiKey, apiKeySecret.secret);
                }
            });
        }
    });
};

// To set a custom APIKey and Secret for a particular room you can make a CURL request with
// apiKey and secret params. eg. 
// curl -k https://localhost:5000/customKey -d "apiKey=APIKEY&secret=SECRET" -X "GET"
// This room has to not already exist though.
app.get('/:room', function(req, res) {
    var room = req.param('room'),
      apiKey = req.param('apiKey'),
      secret = req.param('secret');
    res.format({
        json: function () {
            var goToRoom = function(err, sessionId, apiKey, secret) {
                if (err) {
                    res.send(err);
                } else {
                    res.set({
                        "Access-Control-Allow-Origin": "*"
                    });
                    var otSDK = ot;
                    if (apiKey && secret) {
                        otSDK = new OpenTok(apiKey, secret);
                    }
                    res.send({
                        room: room,
                        sessionId: sessionId,
                        apiKey: (apiKey && secret) ? apiKey : config.apiKey,
                        p2p: isP2P(room),
                        token: otSDK.generateToken(sessionId, {
                            role: "publisher"
                        })
                    });
                }
            };
            getRoom(room, apiKey, secret, goToRoom);
        },
        html: function () {
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
    
    getRoom(room, function(err, sessionId, apiKey, secret) {
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
    var archiveId = req.param('archiveId'),
        room = req.param('room');
    
    // Lookup if there's a custom apiKey for this room
    redis.hget("apiKeys", room, function (err, apiKeySecret) {
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
            
            otSDK.stopArchive(archiveId, function (err, archive) {
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

if(process.env.HEROKU) {
    app.listen(config.port, function() {
        console.log("Listening on " + config.port);
    });
} else {
    https.createServer({key: fs.readFileSync('./server.key', 'utf8'), cert: fs.readFileSync('./server.crt', 'utf8')}, app).listen(config.port, function() {
        console.log("Listening on " + config.port);
    });
}