#!/bin/sh

ssh "$1" -- 'cd ~/git/jg-week13 && git clean -fd && git fetch && git reset --hard origin/master && ./run.sh'
