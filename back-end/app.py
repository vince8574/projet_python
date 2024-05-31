from flask import Flask, request, jsonify
from flask_smorest import Api, Blueprint
from datetime import datetime
from flask_cors import CORS
from routes.product.product import Products
import json
from routes.product.product_controller import product

server = Flask(__name__)
CORS(server, ressources={r"/*": {"origins": "http://localhost:5173"}})  # Autorise les requêtes CORS pour toutes les routes

class APIConfig:
  API_TITLE = "Save Food API V1"
  API_VERSION = "v1"
  OPENAPI_VERSION = "3.0.2"
  OPENAPI_URL_PREFIX = "/"
  OPENAPI_SWAGGER_UI_PATH = "/docs"
  OPENAPI_SWAGGER_UI_URL = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
  OPENAPI_REDOC_PATH = "/redoc"
  OPENAPI_REDOC_UI_URL = "https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"

server.config.from_object(APIConfig)

api = Api(server)

api.register_blueprint(product)




@server.route("/")
def index():
    return {"message": "Welcome to the Save Food API!"}

if __name__ == "__main__":
    server.run(debug=True, port=8080, host="0.0.0.0")
