import datetime
from fpdf import FPDF
import os
import sys
from routes.qr_code.qr_code import QrCode


def pdf_maker(id:str='ck8ZA00RdwSkawoZkNDM'):
        
        pdf=FPDF("P","mm","Letter")
        qr=QrCode()
        qr_img = qr.generate(id)

        #initialisation de mes variables pour le test
        description = "test10"
        dateCreation = "2024-05-25"
        dateFreeze = "2024-05-25"
        dateDefrost = "2024-05-25"

        

        # Specify the complete path to save the image
        save_path = os.path.join('temp', 'qr_code.png')

        # Save the image 
        qr_img.save(save_path) 

        #Add a page
        pdf.add_page()

        # Specify font
        # fonts("times", "courrier", "helvetica", etc...)
        # "B" (bold), "U" (underline), "I" (italics), "" (regular), combination (i.e, ("BU"))
        # "16" (size)
        pdf.set_font("helvetica", "B",12)

        # Ajouter l'image QR code
        pdf.image(save_path, x=10, y=8, w=50)
        
        # Add text
        # w = width
        # h = height
        pdf.ln(4)
        pdf.cell(50) #Décaler le texte de 40 mm
        pdf.cell(120, 10, f"Description: {description}")
        pdf.ln(10)  # Aller à la prochaine ligne avec une marge de 10mm
        pdf.cell(50)
        pdf.cell(120, 10, f"Produit le: {dateCreation}")
        pdf.ln(10) 
        pdf.cell(50)
        pdf.cell(120,10, f"Congelé le: {dateFreeze}")
        pdf.ln(10) 
        pdf.cell(50)
        pdf.cell(120,10, f"Décongelé le: {dateDefrost}")

        return pdf.output("pdf_1.pdf")


pdf=pdf_maker()