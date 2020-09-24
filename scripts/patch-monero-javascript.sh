#!/usr/bin/env bash

git clone monero-javascript 
cd monero-javascript
jq '.name = "monero-javascript-custom"' package.json
rm -rf dist
npm install
npm run build_web_tests
npm link
cd ..
cd frontend
npm link monero-javascript-custom
rm -rf dist
mkdir dist
cp ../monero-javascript/dist/*.{js,wasm,map} dist