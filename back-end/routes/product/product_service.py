from .product_repository import ProductsRepository
from .product import Products

class ProductService:
  def __init__(self):
    self.repository = ProductsRepository()
  
  def get_all(self) -> list[Products]:
    return self.repository.get_all()

  def create_product(self, p: Products) -> Products:
    return self.repository.create_product(p)
  
  def get_product_by_id(self, id):
    return self.repository.get_product_by_id(id)
  
  def delete_product_by_id(self, id):
    return self.delete_product_by_id(id)
  
  def update_product_by_id(self, id):
    return self.update_product_by_id(id)
