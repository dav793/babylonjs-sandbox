#!/bin/sh
cd "$(dirname "$0")"    # use script's location as working directory

echo "Installing editor dependencies..."
npm install

echo 'Success!';