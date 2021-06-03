# USAGE
# python recognize_video.py --detector face_detection_model \
#	--embedding-model openface_nn4.small2.v1.t7 \
#	--recognizer output/recognizer.pickle \
#	--le output/le.pickle

# import the necessary packages
from imutils.video import VideoStream
from imutils.video import FPS
import numpy as np
import argparse
import imutils
import pickle
import time
import cv2
import os
import subprocess
import pyttsx3
import threading

import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import json

def read_config():
	with open('config.json') as f:
  		return json.load(f)

def init_firebase():
	# Fetch the service account key JSON file contents
	cred = credentials.Certificate('firebase.json')
	# Initialize the app with a service account, granting admin privileges
	firebase_admin.initialize_app(cred, {
		'databaseURL': config['db_url']
	})
	ref = db.reference(f"cars/{config['car_name']}")
	ref.update(config['default_car_state'])
	return ref

def open_browser():
	# Linux Start Command
	#subprocess.Popen(["chromium","--start-fullscreen","http://localhost:3000/voice"])
	subprocess.Popen(["C:\Program Files (x86)\Google\Chrome\Application\chrome.exe","--start-fullscreen","http://localhost:3000/voice"])
	
def say_message(message):
	engine = pyttsx3.init()
	engine.setProperty('voice', 'HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\TTS_MS_EN-US_ZIRA_11.0')
	engine.say(message)
	engine.runAndWait()

# firebase init
config = read_config()
firebase_ref = init_firebase()

# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-d", "--detector", required=False,
	help="path to OpenCV's deep learning face detector",
	default="face_detection_model")
ap.add_argument("-m", "--embedding-model", required=False,
	help="path to OpenCV's deep learning face embedding model",
	default="openface.nn4.small2.v1.t7")
ap.add_argument("-r", "--recognizer", required=False,
	help="path to model trained to recognize faces")
ap.add_argument("-l", "--le", required=False,
	help="path to label encoder")
ap.add_argument("-c", "--confidence", type=float, default=0.5,
	help="minimum probability to filter weak detections")
args = vars(ap.parse_args())

# load our serialized face detector from disk
print("[INFO] loading face detector...")
protoPath = os.path.sep.join([args["detector"], "deploy.prototxt"])
modelPath = os.path.sep.join([args["detector"],
	"res10_300x300_ssd_iter_140000.caffemodel"])
detector = cv2.dnn.readNetFromCaffe(protoPath, modelPath)

# load our serialized face embedding model from disk
print("[INFO] loading face recognizer...")
embedder = cv2.dnn.readNetFromTorch(args["embedding_model"])
"""
# load the actual face recognition model along with the label encoder
recognizer = pickle.loads(open(args["recognizer"], "rb").read())
le = pickle.loads(open(args["le"], "rb").read())
"""
# initialize the video stream, then allow the camera sensor to warm up
print("[INFO] starting video stream...")
vs = VideoStream(src=0).start()
time.sleep(5.0)
say_message("Starting the car. You will be recognized shortly")
time.sleep(10.0)

# start the FPS throughput estimator
fps = FPS().start()
detection = None
# loop over frames from the video file stream
while not detection:
	# grab the frame from the threaded video stream
	frame = vs.read()

	# resize the frame to have a width of 600 pixels (while
	# maintaining the aspect ratio), and then grab the image
	# dimensions
	frame = imutils.resize(frame, width=600)
	(h, w) = frame.shape[:2]

	# construct a blob from the image
	imageBlob = cv2.dnn.blobFromImage(
		cv2.resize(frame, (300, 300)), 1.0, (300, 300),
		(104.0, 177.0, 123.0), swapRB=False, crop=False)

	# apply OpenCV's deep learning-based face detector to localize
	# faces in the input image
	detector.setInput(imageBlob)
	detections = detector.forward()

	# loop over the detections
	for i in range(0, detections.shape[2]):
		# extract the confidence (i.e., probability) associated with
		# the prediction
		confidence = detections[0, 0, i, 2]

		# filter out weak detections
		if confidence > args["confidence"]:
			# compute the (x, y)-coordinates of the bounding box for
			# the face
			box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
			(startX, startY, endX, endY) = box.astype("int")

			# extract the face ROI
			face = frame[startY:endY, startX:endX]
			(fH, fW) = face.shape[:2]

			# ensure the face width and height are sufficiently large
			if fW < 20 or fH < 20:
				continue

			# construct a blob for the face ROI, then pass the blob
			# through our face embedding model to obtain the 128-d
			# quantification of the face
			faceBlob = cv2.dnn.blobFromImage(face, 1.0 / 255,
				(96, 96), (0, 0, 0), swapRB=True, crop=False)
			embedder.setInput(faceBlob)
			vec = embedder.forward()

			"""
			# perform classification to recognize the face
			preds = recognizer.predict_proba(vec)[0]
			j = np.argmax(preds)
			proba = preds[j]
			name = le.classes_[j]
			"""
			name = 'Hendrik'
			proba = 1
			# draw the bounding box of the face along with the
			# associated probability
			text = "{}: {:.2f}%".format(name, proba * 100)
			y = startY - 10 if startY - 10 > 10 else startY + 10
			cv2.rectangle(frame, (startX, startY), (endX, endY),
				(0, 0, 255), 2)
			cv2.putText(frame, text, (startX, y),
				cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 2)
			
			if name == "unknown":
				print("Ride deactivated")
			print('Face detected! Start application')
			detection = True

	# update the FPS counter
	if detection:
		say_message("Welcome Hendrik. Your ride will start shortly.")
		say_message("Starting the calling interface")
		firebase_ref.update(config['driving_car_state'])
		open_browser()
		exit()
	fps.update()

	# show the output frame
	cv2.imshow("Frame", frame)
	key = cv2.waitKey(1) & 0xFF

	# if the `q` key was pressed, break from the loop
	if key == ord("q"):
		break

# stop the timer and display FPS information
fps.stop()
print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))

# do a bit of cleanup
cv2.destroyAllWindows()
vs.stop()