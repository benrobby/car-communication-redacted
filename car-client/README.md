# Here you can find the instructions on how to use the Car Client of our service.

## First installation
Firstly, install a couple of programs:
- git (pls also create a github account, if you dont have on at www.github.com and tell me your username)
- install node.js. Just use the 64 Bit LTS installer at https://nodejs.org/en/download/
- Chrome Browser

Now, you can download the project and make it run. :
1. open CMD and type the following commands
2. `git clone https://github.com/benrobby/car-communication.git`
4. `cd car-communication/car-client`
3. `git checkout deploy/person-client-sf`
5. `npm i`
6. `cp -r @zoomus .\node_modules`
7. `npm run start`

Now the software is running. For first usage, accept the request for camera and audio in Chrome

Before each usage, you can enter `git pull` into the CMD to get the latest version of everything.
If `git pull` does not work:
1. Copy `VoiceWidget.tsx` (if you already modified it) into a folder outside `car-communication`
2. Copy `video.scss` (if you already modified it) into a folder outside `car-communication`
3. Run `git reset --hard origin/deploy/person-client-sf`

## Setup cameras

The cameras have to be mapped to the correct names. Each camera has an cameraIndex 0-2. Please use the description below:

File to adjust: `car-communication/car-client/src/feature/word-detection/VoiceWidget.tsx` (line 45-47)

```
    /**
     * Adjust the URLs below:
     * - Match each <ZoomName> (like CarFront) with the corresponding camera index 0-2
     * - for that, you can use the Route /<any-name>/videoAll/<camIndex>, to see which connected camera corresponds to which camera index.
     * - just replace the 0 in the links below with the correct numbers
     */
    setTimeout(() => window.open('http://localhost:3000/CarFront/no-video/**change this to the correct number**', '_blank'), 0);
    setTimeout(() => window.open('http://localhost:3000/CarPortrait/no-video/**0**', '_blank'), 9000);
    setTimeout(() => window.open('http://localhost:3000/CarOverview/video/**0**', '_blank'), 18000);

```
Each computer can set the index individually. When starting, you can verify the correct naming by adding all cameras + accessing the route `/<anyname>/videoAll/<camId>`

## Adjustment of the person shown on the projection surface

As we cut left and right of the person and each computer has individual resolution, it might be required to adjust the positioning of the full screen picture.

File to adjust: `car-communication/car-client/src/feature/video/video.scss` (line 45 and 46)

For that, pleaes got into full screen mode (F11)

Adjust the positioning within `.video-canvas`

```css
margin-top: -25%; /* moves the picture along the shorter axis of the screen. Bigger value = to the right. Smaller value = to the left */
margin-left: -45%; /* moves the picture along the longer axis of the screen. Bigger value = show  adjust */
```
These two lines can be changed. Just play around with the percentage numbers a bit.

## Available routes

Please press F11 to go into full screen mode

To run everything and start make the program listen to voice commands, open [http://localhost:3000/voice](http://localhost:3000/voice). Currently, it can be started with the command PICOVOICE


The car-client has the following routes available:
- `/voice`: This is the route to start with, where you can trigger the system to start by saying the voice command
- `/<zoomName>/no-video/<cam-index>`: This is the route to just connect a camera without showing anything on the screen. It is used twice in the car
- `/<zoomName>/video/<cam-index>`: This is is what is shown on the projection surface. It only shows the other person full screen
- `/<zoomName>/videoAll/<cam-index>`: This is not used, but allows seeing all connected cameras at once (could be relevant for mapping camera with the camera id)



