from flask.views import MethodView
from flask_smorest import Blueprint
from .product import Products
from .product_service import ProductService
from .dto.response.product_response import ProductResponse
from .dto.request.product_create import CreateProduct
from .dto.request.product_update import UpdateProduct
from .product_mapper import to_entity, toUpdateEntity
import json
import tempfile
import os
from werkzeug.utils import secure_filename
from flask import request, abort


product = Blueprint("product", "product", url_prefix="/product", description="product routes")

product_service = ProductService()

@product.route("/")
class ProductsController(MethodView):
  @product.response(status_code=200, schema=ProductResponse)
  def get(self):
    return {"product": product_service.get_all()}
  
  @product.arguments(CreateProduct)
  @product.response(status_code=201, schema=ProductResponse)
  def post(self, product: dict):
    print("POST product", product)
    return product_service.create_product(to_entity(product))
  
  
  @product.route("/scan")
  class SingleProductController(MethodView):
    @product.response(status_code=200, schema=ProductResponse)
    def get(self):
      return product_service.get_product_by_id()
    
    

  
  @product.route("/update")
  class SingleUserController(MethodView):
    @product.response(status_code=200, schema=ProductResponse)
    def get(self, id: str):
      return product_service.get_one(id)
  
    @product.response(status_code=204)
    def delete(self, id: str):
      product_service.delete_user_by_id(id)
      return None

    @product.arguments(UpdateProduct)
    @product.response(status_code=200, schema=ProductResponse)
    def put(self, product: dict):
      print("PUT product", product)
      id = product["id"]
      print(f"l'id est : {id}")
      product.update({"id": id})
      return product_service.update_product_by_id(product)
    
@product.route("/with-photos")
class ProductWithPhotosController(MethodView):
  @product.response(status_code=201, schema=ProductResponse)
  def post(self):
    if 'product' not in request.form:
      abort(400, message="Données du produit manquantes")
    
    try:
      product_data = json.loads(request.form.get('product'))
    except json.JSONDecodeError as e:
      abort(400, message=f"Données JSON invalides: {str(e)}")
    
    if not request.files:
      abort(400, message="Aucune photo fournie")
    
    with tempfile.TemporaryDirectory() as temp_dir:
      photo_paths = []
      
      for key in request.files:
        if key.startswith('photo_'):
          file = request.files[key]
          filename = secure_filename(file.filename)
          file_path = os.path.join(temp_dir, filename)
          file.save(file_path)
          photo_paths.append(file_path)
      
      product = Products(
        designation=product_data.get('designation'),
        totalLot=product_data.get('totalLot'),
        dateCreation=product_data.get('dateCreation'),
        dateFreeze=product_data.get('dateFreeze', ''),
        dateDefrost=product_data.get('dateDefrost', ''),
        nbFreeze=product_data.get('nbFreeze', 0)
      )
      
      return product_service.create_product_with_photos(product, photo_paths)

 