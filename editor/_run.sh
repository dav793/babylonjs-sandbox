#!/bin/sh
cd "$(dirname "$0")"    # use script's location as working directory

echo "Starting editor..."
npm start

# tail -f /dev/null