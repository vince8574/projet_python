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
  
  def get_product_by_id(self, ref: str) -> Products:
    return self.repository.get_product_by_id(ref)
  
  def delete_product_by_id(self, id):
    return self.repository.delete_product_by_id(id)
  
  def update_product_by_id(self, data):
    return self.repository.update_product_by_id(data)

  def delete_photo(self, product_id: str, photo_url: str) -> None:
    return self.repository.delete_photo(product_id, photo_url)
  
  def create_product_with_photos(self, p: Products, photo_paths: list) -> Products:
    return self.repository.create_product_with_photos(p, photo_paths)
  
  def get_product_by_ref(self, ref: str) -> dict:
    try:
        # Fixed: using self.repository instead of self.repo
        query = self.repository.collection.where("ref", "==", ref).stream()
        for doc in query:
            product_data = doc.to_dict()
            product_data['id'] = doc.id
            return product_data
        raise ValueError(f"Aucun produit trouvé avec la référence: {ref}")
    except Exception as e:
        print(f"Erreur lors de la récupération du produit: {e}")
        raise e
  
  def update_product_with_photos(self, data: dict, photo_paths: list = None) -> dict:
    try:
        # Validate photos before passing to repository
        valid_photo_paths = []
        for i, photo_path in enumerate(photo_paths or []):
            if self.validate_image(photo_path):
                valid_photo_paths.append(photo_path)
            else:
                raise ValueError(f"Format d'image invalide pour la photo {i}")
                
        return self.repository.update_product_with_photos(data, valid_photo_paths)
    except Exception as e:
        print(f"Erreur lors de la préparation des photos: {str(e)}")
        raise e
        
  def validate_image(self, image_path):
    """
    Validates if the provided file path points to a valid image with detailed logging
    
    Args:
        image_path: Path to the image file
        
    Returns:
        bool: True if valid, False otherwise
    """
    try:
        from PIL import Image
        import os
        import imghdr
        
        print(f"Validating image: {image_path}")
        
        # Check if file exists
        if not os.path.exists(image_path):
            print(f"❌ Image file not found: {image_path}")
            return False
            
        # Check file size (to ensure it's not empty)
        file_size = os.path.getsize(image_path)
        print(f"File size: {file_size} bytes")
        if file_size == 0:
            print(f"❌ Empty file: {image_path}")
            return False
        
        # Use imghdr to detect image type
        img_type = imghdr.what(image_path)
        print(f"Detected image type: {img_type}")
        if img_type is None:
            print(f"❌ Not recognized as an image: {image_path}")
            return False
            
        # Try to open the image
        print("Attempting to open image with PIL...")
        with Image.open(image_path) as img:
            # Print image details
            print(f"Image format: {img.format}")
            print(f"Image size: {img.size}")
            print(f"Image mode: {img.mode}")
            
            # Verify it's a valid image by attempting to load it
            img.load()
            print("✅ Image loaded successfully")
            return True
    except Exception as e:
        print(f"❌ Image validation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False