#!/bin/bash

echo "Building meet"
npx webpack

echo "Building safe-spaces frontend"
cd safe-meet-frontend
yarn
yarn build
cd ..
