#!/bin/bash -e

if [ "$1" == "--osx-sign" ]; then
  PACKAGER_EXTRA_ARGS="$PACKAGER_EXTRA_ARGS --osx-sign"
fi

ELECTRON_VERSION=$(./node_modules/.bin/electron --version | sed 's/v//')

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
      --protocol-name 'Meet Protocol' \
      --electron-version $ELECTRON_VERSION \
      $PACKAGER_EXTRA_ARGS

    ../../node_modules/.bin/appdmg ../appdmg.json meet-electron.dmg
  popd
popd

echo
echo "Build complete at electron/build/meet-electron.dmg"
