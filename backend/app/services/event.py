import os
import requests
import json

PATH_TO_WILCO_ID = '../.wilco'
BASE_URL = 'https://engine.wilco.gg'
WILCO_ID = os.environ.get('WILCO_ID')

if not WILCO_ID and os.path.exists(PATH_TO_WILCO_ID):
    with open(PATH_TO_WILCO_ID, 'r') as f:
        WILCO_ID = f.read()

EVENTS_ENDPOINT = f'{BASE_URL}/users/{WILCO_ID}/event'

def send_event(event, metadata):
    headers = { 'Content-type': 'application/json' }
    data = { 'event': event, 'metadata': metadata }

    res = requests.post(EVENTS_ENDPOINT, data=json.dumps(data), headers=headers)
    return res
