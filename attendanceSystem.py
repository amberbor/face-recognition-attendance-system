import cv2
import os
import face_recognition
import datetime
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from connection import conn

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# Load Known faces and their names from the 'faces' folder
known_faces = []
known_names = []

today = datetime.date.today().strftime("%d_%m_%Y")


def get_known_encodings():
    global known_faces, known_names
    known_faces = []
    known_names = []
    for filename in os.listdir('static/faces'):
        image = face_recognition.load_image_file(os.path.join('static/faces', filename))
        encoding = face_recognition.face_encodings(image)[0]
        known_faces.append(encoding)
        known_names.append(os.path.splitext(filename)[0])


def totalreg():
    return len(os.listdir('static/faces/'))


def extract_attendance():
    results = conn.read(f"SELECT * FROM {today}")
    return results


def mark_attendance(person):
    name = person.split('_')[0]
    roll_no = int(person.split('_')[1])
    current_time = datetime.datetime.now().strftime("%H:%M:%S")

    exists = conn.read(f"SELECT * FROM {today} WHERE roll_no = {roll_no}")
    if len(exists) == 0:
        try:
            conn.insert(f"INSERT INTO {today} VALUES(%s, %s, %s)", (name, roll_no, current_time))
        except Exception as e:
            print(e)


def identify_person():
    video_capture = cv2.VideoCapture(0)
    attendance_marked = False

    while True:
        ret, frame = video_capture.read()
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        recognized_names = []

        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_faces, face_encoding)
            name = 'Unknown'

            if True in matches:
                matched_indices = [i for i, match in enumerate(matches) if match]
                for index in matched_indices:
                    name = known_names[index]
                    recognized_names.append(name)
        if len(recognized_names) > 0:

            for name in recognized_names:
                mark_attendance(name)

            attendance_marked = True

        cv2.imshow('Camera', frame)

        key = cv2.waitKey(1)

        if key == ord('q') or attendance_marked:
            video_capture.release()
            cv2.destroyAllWindows()
            break

    video_capture.release()
    cv2.destroyAllWindows()


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    conn.create(f"CREATE TABLE IF NOT EXISTS {today} (name VARCHAR(30), roll_no INT, time VARCHAR(10))")
    userDetails = extract_attendance()
    get_known_encodings()
    return templates.TemplateResponse("home.html", {"request": request, "l": len(userDetails),
                                                    "today": today.replace("_", "-"), "totalreg": totalreg(),
                                                    "userDetails": userDetails})


@app.get("/video_feed")
async def video_feed():
    identify_person()
    userDetails = extract_attendance()
    return templates.TemplateResponse("home.html", {"l": len(userDetails),
                                                    "today": today.replace("_", "-"), "totalreg": totalreg(),
                                                    "userDetails": userDetails})


@app.post("/add_user")
async def add_user(request: Request, newusername: str = Form(...), newrollno: int = Form(...)):
    name = newusername
    roll_no = newrollno
    userimagefolder = 'static/faces'
    if not os.path.isdir(userimagefolder):
        os.makedirs(userimagefolder)
    video_capture = cv2.VideoCapture(0)

    while True:
        ret, frame = video_capture.read()
        flipped_frame = cv2.flip(frame, 1)

        text = "Press Q to Capture & Save the Image"

        font = cv2.FONT_HERSHEY_COMPLEX
        font_scale = 0.9

        font_color = (0, 0, 200)

        thickness = 2

        text_size = cv2.getTextSize(text, font, font_scale, thickness)[0]
        text_x = (frame.shape[1] - text_size[0]) // 2
        text_y = (frame.shape[0] - 450)

        cv2.putText(flipped_frame, text, (text_x, text_y), font, font_scale, font_color, thickness, cv2.LINE_AA)

        cv2.imshow('Camera', flipped_frame)

        key = cv2.waitKey(1)
        if key == ord('q'):
            img_name = name+'_'+str(roll_no)+'.jpg'
            cv2.imwrite(userimagefolder+'/'+img_name,flipped_frame)
            video_capture.release()
            cv2.destroyAllWindows()  # Release the video capture and close the OpenCV window
            break
    video_capture.release()
    cv2.destroyAllWindows()

    userDetails = extract_attendance()
    get_known_encodings()
    return templates.TemplateResponse("home.html", {"request": request, "l": len(userDetails),
                                                    "today": today.replace("_", "-"), "totalreg": totalreg(),
                                                    "userDetails": userDetails})

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("attendanceSystem:app", host='0.0.0.0', port=5000, reload=True)
