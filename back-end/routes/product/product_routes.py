from flask import Blueprint, request, jsonify
import json
import tempfile
import os
from werkzeug.utils import secure_filename
from product import Products
from product_repository import ProductsRepository

# Définir le Blueprint avec le préfixe /product
product_bp = Blueprint('product', __name__, url_prefix='/product')
repo = ProductsRepository()

@product_bp.route('/with-photos', methods=['POST'])
def create_product_with_photos():
    # Vérifier que les données du produit sont présentes
    if 'product' not in request.form:
        return jsonify({"error": "Données du produit manquantes"}), 400
    
    try:
        # Décoder les données JSON du produit
        product_data = json.loads(request.form.get('product'))
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Données JSON invalides: {str(e)}"}), 400
    
    # Vérifier que des fichiers ont été fournis
    if not request.files:
        return jsonify({"error": "Aucune photo fournie"}), 400
    
    # Créer un dossier temporaire pour stocker les photos
    with tempfile.TemporaryDirectory() as temp_dir:
        photo_paths = []
        
        # Sauvegarder les photos du formulaire
        for key in request.files:
            if key.startswith('photo_'):
                file = request.files[key]
                filename = secure_filename(file.filename)
                file_path = os.path.join(temp_dir, filename)
                file.save(file_path)
                photo_paths.append(file_path)
        
        # Créer l'objet Products
        product = Products(
            designation=product_data.get('designation'),
            totalLot=product_data.get('totalLot'),
            dateCreation=product_data.get('dateCreation'),
            dateFreeze=product_data.get('dateFreeze', ''),
            dateDefrost=product_data.get('dateDefrost', ''),
            nbFreeze=product_data.get('nbFreeze', 0)
        )
        
        # Enregistrer le produit avec les photos
        result = repo.create_product_with_photos(product, photo_paths)
        
        return jsonify(result), 201

@product_bp.route('/', methods=['GET'])
def get_all_products():
    products = repo.get_all()
    return jsonify(products), 200

@product_bp.route('/scan', methods=['GET'])
def get_product_by_id():
    product = repo.get_product_by_id()
    return jsonify(product), 200

@product_bp.route('/<id>', methods=['DELETE'])
def delete_product(id):
    repo.delete_product_by_id(id)
    return jsonify({"message": "Product deleted successfully"}), 200

@product_bp.route('/<id>', methods=['PUT'])
def update_product(id):
    data = request.json
    data["id"] = id
    result = repo.update_product_by_id(data)
    return jsonify(result), 200

@product_bp.route('/photos/<id>', methods=['DELETE'])
def delete_photo(id):
    photo_url = request.json.get('photo_url')
    repo.delete_photo(id, photo_url)
    return jsonify({"message": "Photo deleted successfully"}), 200