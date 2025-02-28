import os
import uuid
import hashlib
from fpdf import FPDF
from io import BytesIO
from routes.qr_code.qr_code import QrCode
from config.database import db, bucket
from .product import Products
from .product_mapper import to_entity, to_dict
import cv2
from firebase_admin import firestore, storage
from PyPDF2 import PdfReader, PdfWriter
import base64

class ProductsRepository:
    def __init__(self):
        self.collection = db.collection("products")
        self.bucket = bucket

    def create_product(self, p: Products) -> Products:
        p.ref = hashlib.sha256((p.designation).encode("utf-8")).hexdigest()
        photos = self.take_photo('img')
        if photos:
            photo_urls = self.upload_files_to_storage(photos, p.ref)
        else:
            photo_urls = []
        pdf = self.pdf_maker(p.ref, p.designation, p.dateCreation, p.dateFreeze, p.dateDefrost)
        pdf_url = self.upload_file_to_storage(pdf, f"{p.ref}.pdf")
        pdf_hist = self.pdf_maker(p.ref, p.designation, p.dateCreation, p.dateFreeze, p.dateDefrost)
        pdf_url2 = self.upload_file_to_storage(pdf_hist, f"{p.ref}_hist.pdf")
        p.photos = photo_urls
        p.pdf = pdf_url
        p.historique = pdf_url2
        _, docRef = self.collection.add(to_dict(p))
        return to_entity(docRef)

    def get_all(self) -> list[Products]:
        return [to_entity(product) for product in self.collection.stream()]

    def get_product_by_id(self) -> dict:
        qr = QrCode()
        ref = qr.scanner()
        try:
            query = self.collection.where("ref", "==", ref).stream()
            for doc in query:
                product_data = doc.to_dict()
                product_data['id'] = doc.id
                return product_data
            raise ValueError(f"No product found with ref: {ref}")
        except Exception as e:
            print(f"An error occurred: {e}")
            return None

    def delete_product_by_id(self, id: str) -> None:
        try:
            self.collection.document(id).delete()
        except Exception as e:
            print(f"An error occurred: {e}")

    def update_product_by_id(self, data: dict) -> dict:
        try:
            print(f"Le data de productRepository est : {data}")
            docRef = self.collection.document(data["id"])
            existing_data = docRef.get().to_dict()
            
            print("Existing data:", existing_data)
            
            new_pdf = self.pdf_maker(existing_data['ref'], data['designation'], data['dateCreation'], data['dateFreeze'], data['dateDefrost'])
            historique_url = existing_data.get('historique')
        
            print(f"historique_url: {historique_url}")
            
            if historique_url:
                try:
                    print("Je suis rentré dans la boucle")
                    
                    # Extract the blob path correctly
                    blob_path = historique_url.split(self.bucket.name + "/")[1]
                    print(f"Blob path: {blob_path}")

                    historique_blob = self.bucket.blob(blob_path)
                    print(f"Blob exists: {historique_blob.exists()}")

                    if historique_blob.exists():
                        # Télécharger le PDF historique existant
                        historique_pdf = BytesIO()
                        historique_blob.download_to_file(historique_pdf)
                        historique_pdf.seek(0)
                        print("Historique PDF téléchargé avec succès")

                        # Fusionner le PDF historique avec le nouveau PDF
                        merged_pdf = self.merge_pdfs(historique_pdf, new_pdf)
                        print(f"Merged PDF: {merged_pdf}")

                        # Supprimer l'ancien PDF historique
                        historique_blob.delete()
                        print("Ancien PDF historique supprimé avec succès")

                        # Télécharger le nouveau PDF fusionné
                        merged_pdf.seek(0)  # S'assurer que le flux est à la position de départ

                        # Charger le nouveau PDF fusionné dans le stockage
                        unique_hist_filename = generate_unique_filename(f"{existing_data['ref']}_hist")
                        new_hist_url = self.upload_file_to_storage(merged_pdf, unique_hist_filename)
                        print(f"New Hist URL: {new_hist_url}")

                        # Mettre à jour l'URL du PDF historique dans les données à mettre à jour
                        data['historique'] = new_hist_url
                        print(f"data['historique']: {data['historique']}")

                    else:
                        print("Historique blob does not exist")
                        data['historique'] = historique_url
                
                except Exception as e:
                    print(f"An error occurred while processing the historique PDF: {e}")
                    data['historique'] = historique_url
            
            # Générer un nom de fichier unique pour le nouveau PDF principal
            unique_pdf_filename = generate_unique_filename(existing_data['ref'])
            new_pdf.seek(0)  # S'assurer que le flux est à la position de départ
            new_pdf_url = self.upload_file_to_storage(new_pdf, unique_pdf_filename)
            data['pdf'] = new_pdf_url
            
            print("Data to update:", data)
            
            # Mettre à jour les données du produit dans la base de données
            docRef.update(data)
            
            # Récupérer et retourner les données mises à jour
            updated_doc = docRef.get()
            return updated_doc.to_dict()
        
        except ValueError as ve:
            print(f"ValueError occurred: {ve}")
            # Gérer l'erreur de format d'URL spécifiquement ici
            return None
        
        except Exception as e:
            print(f"An error occurred: {e}")
            return None




    def merge_pdfs(self, historique_pdf: BytesIO, new_pdf: BytesIO) -> BytesIO:
        # Créer un PdfWriter
        writer = PdfWriter()

        # Lire le contenu du PDF historique
        historique_reader = PdfReader(historique_pdf)
        for page_num in range(len(historique_reader.pages)):
            writer.add_page(historique_reader.pages[page_num])
        
        # Lire le contenu du nouveau PDF
        new_reader = PdfReader(new_pdf)
        for page_num in range(len(new_reader.pages)):
            writer.add_page(new_reader.pages[page_num])

        # Créer un buffer pour le PDF fusionné
        merged_pdf = BytesIO()
        writer.write(merged_pdf)

        # Revenir au début du buffer pour la lecture future
        merged_pdf.seek(0)

        return merged_pdf


    def pdf_maker(self, ref, designation, dateCreation, dateFreeze, dateDefrost):
        pdf = FPDF("P", "mm", "Letter")
        qr = QrCode()
        qr_img = qr.generate(ref)
        
        save_path = os.path.join('temp', 'qr_code.png')
        qr_img.save(save_path)
        
        pdf.add_page()
        pdf.set_font("helvetica", "B", 12)
        pdf.image(save_path, x=10, y=8, w=50)
        pdf.ln(4)
        pdf.cell(50)
        pdf.cell(120, 10, f"Description: {designation}")
        pdf.ln(10)
        pdf.cell(50)
        pdf.cell(120, 10, f"Produit le: {dateCreation}")
        pdf.ln(10)
        pdf.cell(50)
        pdf.cell(120, 10, f"Congelé le: {dateFreeze}")
        pdf.ln(10)
        pdf.cell(50)
        pdf.cell(120, 10, f"Décongelé le: {dateDefrost}")
        
        pdf_output = BytesIO()
        pdf_str = pdf.output(dest='S')
        pdf_output.write(pdf_str)
        pdf_output.seek(0)
        
        return pdf_output

    def take_photo(self, save_path):
        cam = cv2.VideoCapture(0)
        if not cam.isOpened():
            print("Erreur: Impossible d'ouvrir la webcam")
            return None

        img_counter = 0
        photos_taken = []
        camera = True
        os.makedirs(save_path, exist_ok=True)

        while camera:
            success, frame = cam.read()
            if not success:
                print("Erreur: Impossible de capturer l'image")
                continue

            cv2.imshow(f"Press Space to take photo & ESC to quit Nb photos: {img_counter}", frame)
            k = cv2.waitKey(1)

            if k % 256 == 27:
                cam.release()
                cv2.destroyAllWindows()
                camera = False
                break
            elif k % 256 == 32:
                img_name = f"opencv_frame_{img_counter}.png"
                img_path = os.path.join(save_path, img_name)
                cv2.imwrite(img_path, frame)
                photos_taken.append(img_path)
                img_counter += 1
                cv2.destroyAllWindows()

        cam.release()
        cv2.destroyAllWindows()

        return photos_taken

    def upload_file_to_storage(self, file, file_name):
        blob = self.bucket.blob(file_name)
        blob.upload_from_file(file)
        blob.make_public()
        return blob.public_url

    def upload_files_to_storage(self, files, prefix):
        urls = []
        for i, file in enumerate(files):
            file_name = f"{prefix}_photo_{i}.png"
            blob = self.bucket.blob(file_name)
            blob.upload_from_filename(file)
            blob.make_public()
            urls.append(blob.public_url)
        return urls

    def delete_photo(self, product_id: str, photo_url: str) -> None:
        try:
            blob = self.bucket.blob(photo_url.split("/o/")[1].split("?alt=")[0])
            blob.delete()
            docRef = self.collection.document(product_id)
            docRef.update({
                'photos': firestore.ArrayRemove([photo_url])
            })
        except Exception as e:
            print(f"An error occurred while deleting the photo: {e}")

    def create_product_with_photos(self, p: Products, photo_paths: list) -> Products:
        """Crée un produit avec des photos fournies par l'utilisateur"""
        p.ref = hashlib.sha256((p.designation).encode("utf-8")).hexdigest()
        
        # Télécharger les photos
        if photo_paths:
            photo_urls = self.upload_files_to_storage(photo_paths, p.ref)
        else:
            photo_urls = []
        
        # Générer le PDF
        pdf = self.pdf_maker(p.ref, p.designation, p.dateCreation, p.dateFreeze, p.dateDefrost)
        pdf_url = self.upload_file_to_storage(pdf, f"{p.ref}.pdf")
        
        # Créer un PDF historique
        pdf_hist = self.pdf_maker(p.ref, p.designation, p.dateCreation, p.dateFreeze, p.dateDefrost)
        pdf_url2 = self.upload_file_to_storage(pdf_hist, f"{p.ref}_hist.pdf")
        
        # Mettre à jour les attributs du produit
        p.photos = photo_urls
        p.pdf = pdf_url
        p.historique = pdf_url2
        
        # Enregistrer dans Firestore
        _, docRef = self.collection.add(to_dict(p))
        return to_entity(docRef)

    def upload_photos_from_base64(self, base64_images: list, prefix: str) -> list:
        """Télécharge des images encodées en base64 vers le stockage"""
        urls = []
        
        for i, base64_img in enumerate(base64_images):
            # Extraire les données base64 (supprimer le préfixe data:image/png;base64,)
            if ',' in base64_img:
                base64_data = base64_img.split(',')[1]
            else:
                base64_data = base64_img
            
            # Décoder les données base64
            image_data = base64.b64decode(base64_data)
            file_stream = BytesIO(image_data)
            
            # Télécharger sur Firebase Storage
            file_name = f"{prefix}_photo_{i}.png"
            blob = self.bucket.blob(file_name)
            blob.upload_from_file(file_stream, content_type='image/png')
            blob.make_public()
            
            urls.append(blob.public_url)
        
        return urls

    def create_product_with_photos(self, p: Products, photo_paths: list) -> Products:
        """Creates a product with photos provided by the user"""
        # Create hash reference for the product
        p.ref = hashlib.sha256((p.designation).encode("utf-8")).hexdigest()
        
        # Upload the photos
        if photo_paths:
            photo_urls = self.upload_files_to_storage(photo_paths, p.ref)
        else:
            photo_urls = []
        
        # Generate the PDF
        pdf = self.pdf_maker(p.ref, p.designation, p.dateCreation, p.dateFreeze, p.dateDefrost)
        pdf_url = self.upload_file_to_storage(pdf, f"{p.ref}.pdf")
        
        # Create a history PDF
        pdf_hist = self.pdf_maker(p.ref, p.designation, p.dateCreation, p.dateFreeze, p.dateDefrost)
        pdf_url2 = self.upload_file_to_storage(pdf_hist, f"{p.ref}_hist.pdf")
        
        # Update the product attributes
        p.photos = photo_urls
        p.pdf = pdf_url
        p.historique = pdf_url2
        
        # Save to Firestore and return
        _, docRef = self.collection.add(to_dict(p))
        return to_entity(docRef)

    def upload_photos_from_base64(self, base64_images: list, prefix: str) -> list:
            """Uploads base64 encoded images to storage"""
            urls = []
            
            for i, base64_img in enumerate(base64_images):
                # Extract base64 data (remove data:image/png;base64, prefix)
                if ',' in base64_img:
                    base64_data = base64_img.split(',')[1]
                else:
                    base64_data = base64_img
                
                # Decode base64 data
                image_data = base64.b64decode(base64_data)
                file_stream = BytesIO(image_data)
                
                # Upload to Firebase Storage
                file_name = f"{prefix}_photo_{i}.png"
                blob = self.bucket.blob(file_name)
                blob.upload_from_file(file_stream, content_type='image/png')
                blob.make_public()
                
                urls.append(blob.public_url)
            
            return urls

def generate_unique_filename(prefix):
        return f"{prefix}_{uuid.uuid4().hex}.pdf"

    