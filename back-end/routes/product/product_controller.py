from flask.views import MethodView
from flask_smorest import Blueprint

from .product_service import ProductService
from .dto.response.product_response import ProductResponse
from .dto.request.product_create import CreateProduct
from .dto.request.product_update import UpdateProduct
from .product_mapper import to_entity, toUpdateEntity


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

 