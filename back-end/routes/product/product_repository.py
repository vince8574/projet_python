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
from PyPDF2 import PdfMerger

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
                    parts = historique_url.split("/o/")
                    print(f"URL parts: {parts}")
                    
                    if len(parts) < 2:
                        raise ValueError("Invalid URL format")
                    
                    blob_path = parts[1].split("?alt=")[0]
                    print(f"Blob path: {blob_path}")
                    
                    historique_blob = self.bucket.blob(blob_path)
                    print(f"Blob exists: {historique_blob.exists()}")
                    
                    historique_pdf = BytesIO()
                    historique_blob.download_to_file(historique_pdf)
                    historique_pdf.seek(0)
                    print("Historique PDF téléchargé avec succès")

                    merged_pdf = self.merge_pdfs(historique_pdf, new_pdf)
                    print(f"Merged PDF: {merged_pdf}")
                    
                    unique_hist_filename = generate_unique_filename(f"{existing_data['ref']}_hist")
                    new_hist_url = self.upload_file_to_storage(merged_pdf, unique_hist_filename)
                    print(f"New Hist URL: {new_hist_url}")
                    
                    data['historique'] = new_hist_url
                    print(f"data['historique']: {data['historique']}")
                except Exception as e:
                    print(f"An error occurred while processing the historique PDF: {e}")
                    data['historique'] = historique_url
            
            unique_pdf_filename = generate_unique_filename(existing_data['ref'])
            new_pdf_url = self.upload_file_to_storage(new_pdf, unique_pdf_filename)
            data['pdf'] = new_pdf_url
            
            print("Data to update:", data)
            docRef.update(data)
            updated_doc = docRef.get()
            return updated_doc.to_dict()
        except Exception as e:
            print(f"An error occurred: {e}")
            return None

    def merge_pdfs(self, existing_pdf, new_pdf):
        print("Merging PDFs")
        try:
            merger = PdfMerger()
            merger.append(existing_pdf)
            merger.append(new_pdf)
            print("PDFs appended successfully")
            
            merged_pdf = BytesIO()
            merger.write(merged_pdf)
            merged_pdf.seek(0)
            print("PDFs merged successfully")
            return merged_pdf
        except Exception as e:
            print(f"An error occurred while merging PDFs: {e}")
            raise e

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
        pdf_str = pdf.output(dest='S').encode('latin1')
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

def generate_unique_filename(prefix):
    return f"{prefix}_{uuid.uuid4().hex}.pdf"
