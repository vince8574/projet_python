import cv2

# Test des indices de caméra disponibles
indices_camera = [0, 1, 2, 3, 4, 5]
camera_found = False

for i in indices_camera:
    cam = cv2.VideoCapture(i)
    if cam.isOpened():
        print(f"Camera index {i} opened successfully.")
        camera_found = True
        break
    else:
        print(f"Cannot open camera index {i}")

if not camera_found:
    print("No camera available")
    exit()

while True:
    success, frame = cam.read()
    if not success:
        print("Failed to grab frame")
        break

    cv2.imshow("Camera Test", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cam.release()
cv2.destroyAllWindows()
