import requests

url = 'http://127.0.0.1:8080/'

print((requests.get(url).json()).get("message"))