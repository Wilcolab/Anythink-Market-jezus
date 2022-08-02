#!/bin/sh

export PYTHONPATH="${PYTHONPATH}:${PWD}"

python3 ./app/db/seeds.py
