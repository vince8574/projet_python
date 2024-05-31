import cv2
from pyzbar.pyzbar import decode
import time

cam = cv2.VideoCapture(0)
#cam.set(3, 640)  # ID 3 correspond à la largeur
#cam.set(4, 480)  # ID 4 correspond à la hauteur

camera = True

while camera:
    success, frame = cam.read()
    if not success:
        print("La caméra ne fonctionne pas")

    for i in decode(frame):
        print(i.type)
        print(i.data.decode('utf-8'))
        time.sleep(6)

    cv2.imshow("Qr_Code_Scanner", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cam.release()
cv2.destroyAllWindows()
