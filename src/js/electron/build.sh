#!/bin/bash -e

pushd src/js/electron
  npm install
popd

mkdir -p build
pushd build
  rm -rf meet-electron*

  ../node_modules/.bin/electron-packager ../src/js/electron meet-electron \
    --icon ../public/images/opentok-meet-logo.png.icns \
    --protocol meet \
    --protocol-name 'Meet Protocol'
    # --osx-sign

  ../node_modules/.bin/appdmg ../src/js/electron/appdmg.json meet-electron.dmg
popd

echo
echo "Build complete at build/meet-electron.dmg"
