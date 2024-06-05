import os
from fpdf import FPDF
from io import BytesIO
from routes.qr_code.qr_code import QrCode
from config.database import db, bucket
from .product import Products
from .product_mapper import to_entity, to_dict
import cv2
import firebase_admin
from firebase_admin import firestore, storage

# Create the class for managing the books collection
class ProductsRepository:
    def __init__(self):
        self.collection = db.collection("products")
        self.bucket = bucket
  
    def create_product(self, p: Products) -> Products:
        print(p)
        
        _, docRef = self.collection.add(to_dict(p))
        doc_Ref = to_entity(docRef)
        id = doc_Ref.id
        print(f"L'id de la collection est :{id}")

        # Prendre une ou des photo(s)
        photos = self.take_photo('img')
        
        if photos:
            print("Photos taken:", photos)

        # Charger les photos sur Firebase Storage et obtenir les URLs
        photo_urls = self.upload_photos_to_storage(photos, id)

        # Création du PDF
        designation = doc_Ref.designation
        dateCreation = doc_Ref.dateCreation
        dateFreeze = doc_Ref.dateFreeze
        dateDefrost = doc_Ref.dateDefrost
  
        pdf = self.pdf_maker(id, designation, dateCreation, dateFreeze, dateDefrost)
        
        # Définir le chemin dans Firebase Storage
        blob = self.bucket.blob(f'pdfs/{id}.pdf')
        
        # Charger les données PDF dans Firebase Storage
        blob.upload_from_file(pdf, content_type='application/pdf', predefined_acl='publicRead')
        # predefined_acl='publicRead rend le fichier accessible au public en lecture seule. 

        # Rendre le blob publiquement accessible (optionnel)
        blob.make_public()

        # Obtenir l'URL du fichier chargé
        pdf_url = blob.public_url
        print(f'PDF URL: {pdf_url}')
        
        # Mettre à jour le document Firestore avec l'URL du PDF et les URLs des photos
        self.update_product_by_id(id, {"id": id, "pdf": pdf_url, "photos": photo_urls})
    
        return to_entity(docRef)

    def get_all(self) -> list[Products]:
        return [to_entity(product) for product in self.collection.stream()]

    def get_product_by_id(self) -> dict:
        qr = QrCode()
        id = qr.scanner()
        # Convertir l'id en chaîne de caractères et supprimer les espaces blancs en début et fin
        #id = str(id).strip()
        print(f"l'id scanné est : {id}")
        try:
            doc = self.collection.document(id).get()
            if doc.exists:
                return doc.to_dict()
            else:
                raise ValueError(f"User with ID {id} does not exist")
        except Exception as e:
            print(f"An error occurred: {e}")
            return None

    def delete_product_by_id(self, id: str) -> None:
        try:
            self.collection.document(id).delete()
            print(f"User with ID {id} has been deleted")
        except Exception as e:
            print(f"An error occurred: {e}")

    def update_product_by_id(self, id: str, data: dict) -> dict:
        try:
            docRef = self.collection.document(id)
            docRef.update(data)
            updated_doc = docRef.get()
            return updated_doc.to_dict()
        except Exception as e:
            print(f"An error occurred: {e}")
            return None

    def pdf_maker(self, id, designation, dateCreation, dateFreeze, dateDefrost):
        pdf = FPDF("P", "mm", "Letter")
        qr = QrCode()
        qr_img = qr.generate(id)
    
        # Spécifier le chemin complet pour enregistrer l'image
        save_path = os.path.join('temp', 'qr_code.png')

        # Enregistrer l'image
        qr_img.save(save_path) 

        # Ajouter une page
        pdf.add_page()

        # Spécifier la police
        pdf.set_font("helvetica", "B", 12)

        # Ajouter l'image du code QR
        pdf.image(save_path, x=10, y=8, w=50)
    
        # Ajouter du texte
        pdf.ln(4)
        pdf.cell(50)  # Décaler le texte de 50 mm
        pdf.cell(120, 10, f"Description: {designation}")
        pdf.ln(10)  # Aller à la ligne suivante avec une marge de 10 mm
        pdf.cell(50)
        pdf.cell(120, 10, f"Produit le: {dateCreation}")
        pdf.ln(10)
        pdf.cell(50)
        pdf.cell(120, 10, f"Congelé le: {dateFreeze}")
        pdf.ln(10)
        pdf.cell(50)
        pdf.cell(120, 10, f"Décongelé le: {dateDefrost}")

        pdf.output("pdf_temp.pdf")
        # Enregistrer le PDF dans un objet BytesIO
        pdf_output = BytesIO()
        pdf_str = pdf.output(dest='S').encode('latin1')  # Obtenir le contenu du PDF en tant que chaîne de caractères
        pdf_output.write(pdf_str)
    
        # Réinitialiser le curseur de l'objet BytesIO
        pdf_output.seek(0)
    
        return pdf_output

    # Fonction pour capturer des photos
    def take_photo(self, save_path):
        # Initialiser la webcam
        cam = cv2.VideoCapture(0)  # 0 pour la première webcam disponible
      
        # Vérifier si la webcam est ouverte avec succès
        if not cam.isOpened():
            print("Erreur: Impossible d'ouvrir la webcam")
            return None
      
        img_counter = 0
        photos_taken = []
        camera = True
        # Créer les répertoires nécessaires
        os.makedirs(save_path, exist_ok=True)

        while camera:
            success, frame = cam.read()

            # Vérifier si l'image a été capturée avec succès
            if not success:
                print("Erreur: Impossible de capturer l'image")
                continue  # Recommencer la boucle pour tenter une nouvelle capture

            cv2.imshow(f"Press Space to take photo & ESC to quit Nb photos: {img_counter}", frame)

            k = cv2.waitKey(1)

            if k % 256 == 27: # correspond à la touche Escape
                print("Escape hit, closing the app")
                cam.release()
                cv2.destroyAllWindows()
                camera = False
                break
            elif k % 256 == 32: # correspond à la barre espace
                img_name = f"opencv_frame_{img_counter}.png"
                # Spécifier le chemin complet pour enregistrer l'image
                img_path = os.path.join(save_path, img_name)
                cv2.imwrite(img_path, frame)
                print(f"Screenshot taken and saved as {img_path}")
                photos_taken.append(img_path)
                img_counter += 1
                cv2.destroyAllWindows()


        # Fermer la webcam et détruire toutes les fenêtres ouvertes
        cam.release()
        cv2.destroyAllWindows()
      
        return photos_taken

    def upload_photos_to_storage(self, photos, id):
        photo_urls = []
        for photo_path in photos:
            blob = self.bucket.blob(f'photos/{id}/{os.path.basename(photo_path)}')
            blob.upload_from_filename(photo_path, content_type='image/png', predefined_acl='publicRead')
            blob.make_public()
            photo_urls.append(blob.public_url)
        return photo_urls
    
    def delete_photo(self, product_id: str, photo_url: str) -> None:
        try:
            # Supprimer l'image de Google Cloud Storage
            blob = self.bucket.blob(photo_url.split("/o/")[1].split("?alt=")[0])
            blob.delete()

            # Supprimer l'URL de l'image de Firestore
            docRef = self.collection.document(product_id)
            docRef.update({
                'photos': firestore.ArrayRemove([photo_url])
            })

            print(f"Photo {photo_url} has been deleted from product {product_id}")

        except Exception as e:
            print(f"An error occurred while deleting the photo: {e}")