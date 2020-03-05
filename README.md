[![Build Status](https://travis-ci.org/opentok/opentok-meet.svg?branch=master)](https://travis-ci.org/opentok/opentok-meet)
[![Code Climate](https://codeclimate.com/github/opentok/opentok-meet/badges/gpa.svg)](https://codeclimate.com/github/opentok/opentok-meet)
[![Test Coverage](https://codeclimate.com/github/opentok/opentok-meet/badges/coverage.svg)](https://codeclimate.com/github/opentok/opentok-meet/coverage)

opentok-meet
===============

Opentok app with screen sharing using the WebRTC screen sharing and Archiving features. You can check it out running at [meet.tokbox.com](https://meet.tokbox.com).

## Disclaimers


>This is a fork of the [opentok-meet](https://github.com/aullman/opentok-meet) project that deploys to [meet.tokbox.com](https://meet.tokbox.com). It is pointing to the OpenTok nightly environment which is experimental and likely to break. It also includes experimental features.

>If you wish to fork this project, please fork the [parent project](https://github.com/aullman/opentok-meet).

## Deploying to meet.tokbox.com

If you push to the master branch of this repo [Travis](https://travis-ci.org/opentok/opentok-meet) and [BrowserStack](https://browserstack.com/automate) tests will run and when they pass meet.tokbox.com will be updated.

## Electron

Electron is an optional dependency because it requires Cairo on your system and isn't necessary for theest of opentok-meet. If you run into problems below, try this:

```sh
brew update
brew install cairo
npm install
```

During development the electron version can be quickly started by running

```sh
npm run electron
```

And a dmg for installation can be created with

```sh
npm run electron-build
```

To create a signed build (so the user is not warned when starting the app), you will need an appropriate certificate available on your machine (getting one is beyond the scope of this guide). If the certificate is available, it can be used by adding `-- --osx-sign` to the command above.
