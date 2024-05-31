import qrcode
from PIL import Image
import os

def generate_qr_code(id: str = "Olympe est la plus belle", numLot: str = "Et c'est vrai!"):
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
    qr.add_data(f'ID: {id}, NumLot: {numLot}')
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_img.save("qr_code3.png")
    return qr_img



# Create the folder 'temp' if he doesn't exist
if not os.path.exists('temp'):
    os.makedirs('temp')

qr_img = generate_qr_code()

# Specify the complete path to save the image
save_path = os.path.join('temp', 'qr_code5.png')

# Save the image 
qr_img.save(save_path)  
