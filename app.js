var express = require("express"),
    app = express(),
    config;

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
        console.log("Error reading config.json - have you copied config.json.sample to config.json?");
        process.exit();
    }
}

app.use(express.logger());

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.listen(config.port, function() {
  console.log("Listening on " + config.port);
});