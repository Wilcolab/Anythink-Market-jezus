#!/bin/bash

API_BASE_URL="${API_BASE_URL:="https://engine.wilco.gg"}"
WILCO_ID="`cat .wilco 2> /dev/null`"

sendEvent() {
  error=${2//$'\n'/\\n}
  body='{"event":"start_quest_script_ran", "metadata": {"success": '$1', "remote": false, "error": "'$error'"}}'
  curl -m 5 -X POST $API_BASE_URL/users/$WILCO_ID/event -d "$body" -H 'Content-Type: application/json' &> /dev/null
}

if [[ -z $WILCO_ID ]]; then
  printf "Please run the script in the root folder of the repo. Aborting.\n"
  exit 1
fi

printf "[=  ] Stashing any existing changes ... \n"
git stash &> /dev/null

printf "[== ] Resetting local 'main' branch to 'origin/main' ... \n"
git_output=$((git checkout main && git fetch origin main && git reset --hard origin/main) 2>&1 > /dev/null)
git_exit_code=$?

if ! test "$git_exit_code" -eq 0
then
   printf "[==X] ERROR: Could not reset local 'main' branch. Aborting.\n"
   sendEvent false "$git_output"
   echo "[==X] GIT ERROR: $git_output"
   exit 1
fi

printf "[===] SUCCESS: Your local 'main' branch is now up to date with origin.\n"
sendEvent true
exit 0
