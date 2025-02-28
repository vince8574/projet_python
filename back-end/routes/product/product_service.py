from .product_repository import ProductsRepository
from .product import Products
from ..qr_code.qr_code import QrCode

class ProductService:
  def __init__(self):
    self.repository = ProductsRepository()
  
  def get_all(self) -> list[Products]:
    return self.repository.get_all()

  def create_product(self, p: Products) -> Products:
    return self.repository.create_product(p)
  
  def get_product_by_id(self):
    return self.repository.get_product_by_id()
  
  def delete_product_by_id(self, id):
    return self.repository.delete_product_by_id(id)
  
  def update_product_by_id(self, data):
    return self.repository.update_product_by_id(data)

  def delete_photo(self, product_id: str, photo_url: str) -> None:
    return self.repository.delete_photo(product_id, photo_url)
  
  def create_product_with_photos(self, p: Products, photo_paths: list) -> Products:
    return self.repository.create_product_with_photos(p, photo_paths)
  
  
