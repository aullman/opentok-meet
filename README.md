opentok-meet
===============

Opentok app with screen sharing using the WebRTC screen sharing and Archiving features. You can check it out running at [meet.tokbox.com](https://meet.tokbox.com). 

## Running locally

1. Clone this repo
2. `cp config.json.sample config.json`
3. Add your apikey and secret to config.json
4. Run [redis](http://redis.io/)
5. `npm install`
6. If you want to use SSL you will need to generate a key and make sure the server.key and server.crt files are in the main directory. You can find instructions for generating a self-signed certificate [here](https://devcenter.heroku.com/articles/ssl-certificate-self). SSL is recommended so that screen-sharing works and so that you don't have to keep clicking the allow button to allow access to your camera. If you still don't want to use SSL then just update [app.js](app.js) to use `http.createServer` instead of `http.createServer`.
7. `node app`
8. Go to https://localhost:3000

## Running on Heroku

1. Create a [Heroku](heroku.com) instance
2. Clone this repo
3. In the repo run `heroku git:remote -a <instance name>` to add the remote to github.
4. Add redistogo `heroku addons:add redistogo`
5. Add your API Key and Secret to the environment `heroku config:set HEROKU=true OT_API_KEY=<YOUR_API_KEY> OT_API_SECRET=<YOUR_SECRET>`
6. `git push heroku master`
7. Visit your heroku URL