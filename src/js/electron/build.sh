#!/bin/bash -e

pushd src/js/electron
  npm install
popd

./node_modules/.bin/electron-packager src/js/electron meet-electron \
  --icon public/images/opentok-meet-logo.png.icns \
  --protocol meet \
  --protocol-name 'Meet Protocol' \
  --overwrite \
  # --osx-sign

BUILD_DIRNAME=$(echo meet-electron* | cut -d' ' -f1)

tar czf $BUILD_DIRNAME.tgz $BUILD_DIRNAME
