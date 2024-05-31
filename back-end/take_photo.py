import cv2

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
            cv2.imwrite(img_name, frame)
            print(f"Screenshot taken and saved as {img_name}")
            img_counter += 1
            cv2.destroyAllWindows()

    # Fermer la webcam et détruire toutes les fenêtres ouvertes
    cam.release()
    cv2.destroyAllWindows()
    
    return frame

# Appeler la fonction pour capturer une photo
photo = take_photo()

# Vérifier si la photo a été capturée avec succès
if photo is not None:
    # Afficher la photo (optionnel)
    cv2.imshow('Photo', photo)
    cv2.waitKey(0)  # Attendre une touche pour fermer la fenêtre
    cv2.destroyAllWindows()

   
