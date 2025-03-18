import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, storage

# Récupérer les variables d'environnement
firebase_config = {
    "type": os.environ.get("FIREBASE_TYPE"),
    "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
    "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.environ.get("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),  # Gérer les sauts de ligne
    "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.environ.get("FIREBASE_CLIENT_ID"),
    "auth_uri": os.environ.get("FIREBASE_AUTH_URI"),
    "token_uri": os.environ.get("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_X509_CERT_URL"),
    "universe_domain": os.environ.get("FIREBASE_UNIVERSE_DOMAIN")
}

# Initialiser Firebase avec les variables d'environnement
cred = credentials.Certificate(firebase_config)
firebase_admin.initialize_app(cred, {
    'storageBucket': 'savefood-3109e.appspot.com'
})

db = firestore.client()
bucket = storage.bucket()