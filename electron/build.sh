#!/bin/bash -e

pushd electron
  pushd app
    mkdir -p node_modules
    npm install
  popd

  rm -rf build
  mkdir build
  pushd build
    ../../node_modules/.bin/electron-packager ../app meet-electron \
      --icon ../logo.icns \
      --protocol meet \
      --protocol-name 'Meet Protocol'
      # --osx-sign

    ../../node_modules/.bin/appdmg ../appdmg.json meet-electron.dmg
  popd
popd

echo
echo "Build complete at electron/build/meet-electron.dmg"
