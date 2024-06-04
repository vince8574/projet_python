import cv2
from pyzbar.pyzbar import decode
import qrcode
from PIL import Image

class QrCode:
    def __init__(self):
        pass
    
    def generate(self, id:str ="", numLot:str=""):
        
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
        qr.add_data(f'{id}')
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_img.save("qr_code3.png")
        return qr_img

    def scanner(self):

        cam = cv2.VideoCapture(0)
        #cam.set(3, 640)  # ID 3 correspond à la largeur
        #cam.set(4, 480)  # ID 4 correspond à la hauteur

        camera = True

        while camera:
            success, frame = cam.read()
            if not success:
                print("La caméra ne fonctionne pas")

            for i in decode(frame):
                
                id=i.data.decode('utf-8')
                camera=False
                break

            cv2.imshow("Scannez votre QRCODE, q pour quitter", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                camera = False
                break

        cam.release()
        cv2.destroyAllWindows()
        print(id)
        return id
