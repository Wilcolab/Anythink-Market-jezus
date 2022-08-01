#!/usr/bin/env bash
#
# Usage: bin/heroku_deploy

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NO_COLOR='\033[0m'

set -euo pipefail

printf "\n⏳${YELLOW}   [Release Phase]: Running schema migrations.${NO_COLOR}\n"
alembic upgrade head
printf "\n⏳${YELLOW}   [Release Phase]: Seeding.${NO_COLOR}\n"
./seeds.sh
printf "\n🎉${GREEN}   [Release Phase]: Database is up to date.${NO_COLOR}\n"
