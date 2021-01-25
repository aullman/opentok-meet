[![Build Status](https://travis-ci.org/opentok/opentok-meet.svg?branch=master)](https://travis-ci.org/opentok/opentok-meet)
[![Code Climate](https://codeclimate.com/github/opentok/opentok-meet/badges/gpa.svg)](https://codeclimate.com/github/opentok/opentok-meet)
[![Test Coverage](https://codeclimate.com/github/opentok/opentok-meet/badges/coverage.svg)](https://codeclimate.com/github/opentok/opentok-meet/coverage)

# opentok-meet

Opentok app with screen sharing using the WebRTC screen sharing and Archiving features. You can check it out running at [meet.tokbox.com](https://meet.tokbox.com).

## Disclaimer

> This project deploys to [meet.tokbox.com](https://meet.tokbox.com). It is pointing to the OpenTok nightly environment which is experimental and likely to break. It also includes experimental features.
> This was originally a fork of [aullman/opentok-meet](https://github.com/aullman/opentok-meet) but is now diverged and is not updated with changes made there.

## Deploying to meet.tokbox.com

If you push to the master branch of this repo [Travis](https://travis-ci.org/opentok/opentok-meet) and [BrowserStack](https://browserstack.com/automate) tests will run and when they pass meet.tokbox.com will be updated.

## Requirements

- [node.js](https://nodejs.org/en/download/releases/) (version 8)
- [redis](https://redis.io/) (Recommended to install via homebrew on mac: [see instructions](https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298))

## Running meet locally

- Copy the contents of `config.json.sample` into `config.json` and add your credentials.
  :warning: Note: the default config points to tbdev. If you intend to use a production api key you must change `apiUrl` and `opentokJs` to point to production endpoints.

- Ensure redis is running (e.g. `redis-server` on mac)

- Install npm dependencies and build the web project

```
npm i
npm run build
```

- Run the server:

```
npm start
```

You should now see the app running at http://localhost:3000/

## Electron

Electron is an optional dependency because it requires Cairo on your system and isn't necessary for the rest of opentok-meet. If you run into problems below, try this:

```sh
brew update
brew install cairo
npm install
```

During development, the electron version can be quickly started by running

```sh
npm run electron
```

And a dmg for installation can be created with

```sh
npm run electron-build
```

To create a signed build (so the user is not warned when starting the app), you will need an appropriate certificate available on your machine (getting one is beyond the scope of this guide). If the certificate is available, it can be used by adding `-- --osx-sign` to the command above.
