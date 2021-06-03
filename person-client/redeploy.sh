#!/bin/sh

git checkout main
git pull
git checkout deploy/person-client
git pull
git merge main --no-edit
git push
git checkout deploy/person-client-sf
git pull
git merge main --no-edit
git push
