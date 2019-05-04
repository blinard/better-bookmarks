#!/bin/bash

if [[ -z $1 ]]; then
    echo "Usage: buildReleaseImage versionTag"
    echo "Eg: buildReleaseImage 1.1"
else
    docker build -f Dockerfiles/release.Dockerfile -t blinard/better-bookmarks:$1 --force-rm .
fi
