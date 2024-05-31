import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))))
from fpdf import FPDF
from routes.qr_code.qr_code import QrCode
from config.database import db, bucket
from io import BytesIO
from .product import Products
from .product_mapper import to_entity, to_dict
import cv2


# Create the class for managing the books collection
class ProductsRepository:
  def __init__(self):
    self.collection = db.collection("products")
    self.bucket = bucket
  
  def create_product(self, p: Products) -> Products:
    print(p)
        
    _, docRef = self.collection.add(to_dict(p))
    doc_Ref = to_entity(docRef)
    id= doc_Ref.id
    print(f"L'id de la collection est :{id}")

    # Prendre une ou des photo(s)
    photos = self.take_photo('img')
        
    if photos:
        print("Photos taken:", photos)

    # Charger les photos sur Firebase Storage et obtenir les URLs
    photo_urls = self.upload_photos_to_storage(photos, id)


    #création du pdf
    designation=doc_Ref.designation
    dateCreation=doc_Ref.dateCreation
    dateFreeze=doc_Ref.dateFreeze
    dateDefrost=doc_Ref.dateDefrost
  
    pdf=self.pdf_maker(id, designation, dateCreation, dateFreeze, dateDefrost)
    
    # Define the path in Firebase Storage
    blob = self.bucket.blob(f'pdfs/{id}.pdf')
        
    # Upload the PDF data to Firebase Storage
    blob.upload_from_file(pdf, content_type='application/pdf', predefined_acl='publicRead')
    # predefined_acl='publicRead rend le fichier accessible au public en lecture seule. 

    # Make the blob publicly viewable (optional)
    blob.make_public()

    # Get the URL of the uploaded file
    pdf_url = blob.public_url
    print(f'PDF URL: {pdf_url}')
        
    # Mettre à jour le document Firestore avec l'URL du PDF et les URLs des photos
    self.update_product_by_id(id, {"id": id, "pdf": pdf_url, "photos": photo_urls})
    

    return to_entity(docRef)

  def get_all(self) -> list[Products]:
    return [to_entity(product) for product in self.collection.stream()]

  

  def get_product_by_id(self, id: str) -> dict:
    
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

    # Enregistrer le PDF dans un objet BytesIO
    pdf_output = BytesIO()
    pdf_str = pdf.output(dest='S').encode('latin1')  # Obtenir le contenu du PDF en tant que chaîne de caractères
    pdf_output.write(pdf_str)
    
    # Réinitialiser le curseur de l'objet BytesIO
    pdf_output.seek(0)
    
    return pdf_output

  # Fonction pour capturer une photo
  def take_photo():
      # Initialiser la webcam
      cam = cv2.VideoCapture(0)  # 0 pour la première webcam disponible
      
      # Vérifier si la webcam est ouverte avec succès
      if not cam.isOpened():
          print("Erreur: Impossible d'ouvrir la webcam")
          return None
      
      img_counter = 0

      
      while True:
          success, frame = cam.read()

          # Vérifier si l'image a été capturée avec succès
          if not success:
              print("Erreur: Impossible de capturer l'image")
              continue  # Recommencer la boucle pour tenter une nouvelle capture

          
          cv2.imshow(f"Press Space to take photo & ESC to quit Nb photos: {img_counter}", frame)

          k = cv2.waitKey(1)

          if k % 256 == 27: #correspond à la touche Escape
              print("Escape hit, closing the app")
              break
          elif k % 256 == 32: #correspond à la barre espace
              img_name = f"opencv_frame_{img_counter}.png"
              # Spécifier le chemin complet pour enregistrer l'image
              save_path = os.path.join('img', img_name)
              cv2.imwrite(save_path, frame)
              print(f"Screenshot taken and saved as {img_name}")
              img_counter += 1
              cv2.destroyAllWindows()

      # Fermer la webcam et détruire toutes les fenêtres ouvertes
      cam.release()
      cv2.destroyAllWindows()
      
      return frame