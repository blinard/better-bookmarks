#!/bin/bash

if [[ -z $1 ]]; then
    echo "Usage: buildReleaseImage versionTag"
    echo "Eg: buildReleaseImage 1.1"
else
    docker build --build-arg VERSION=$1 --build-arg BUILDCONFIG=Release --tag blinard/bb-func:$1 . 
fi
