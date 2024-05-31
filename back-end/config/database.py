import os

import firebase_admin
from firebase_admin import credentials, firestore, storage

CURR_DIR = os.path.dirname(__file__)
cred = credentials.Certificate(f"{CURR_DIR}/save_food_creds.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'savefood-3109e.appspot.com'
})

db = firestore.client()
bucket = storage.bucket()