import cv2

cam = cv2.VideoCapture(0)

if not cam.isOpened():
    print("Cannot open camera")
    exit()

# Essayer différentes résolutions
resolutions = [(640, 480), (320, 240), (1280, 720)]

for width, height in resolutions:
    cam.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cam.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    success, frame = cam.read()
    if success:
        print(f"Successfully grabbed frame at resolution {width}x{height}")
        break
    else:
        print(f"Failed to grab frame at resolution {width}x{height}")

if not success:
    print("Failed to grab frame at all resolutions")
    cam.release()
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
