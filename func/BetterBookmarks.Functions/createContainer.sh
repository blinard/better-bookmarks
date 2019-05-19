#!/bin/bash

if [[ -z $1 ]]; then
    echo "Usage: creatContainer versionTag"
    echo "Eg: creatContainer 1.7"
else
    docker create --publish 8000:80 --name bb blinard/bb-func:$1
fi
