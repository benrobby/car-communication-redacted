import { useEffect, useState } from "react";
import { usePorcupine } from "@picovoice/porcupine-web-react";
// import type { PorcupineWorkerFactory } from "@picovoice/porcupine-web-en-worker";
import { PorcupineWorkerFactory } from "@picovoice/porcupine-web-en-worker";
import { useHistory } from "react-router";
import logo from '../../img/final_logo_black.png';
import { wakeword } from './base64-voice.js';
import firebase from "firebase/app";
import {PERSON_TO_CALL} from '../../config/dev'

export default function VoiceWidget() {
    const [keywordDetections, setKeywordDetections] = useState<string[]>([]);
    const [workerChunk, setWorkerChunk] = useState<Record<string, PorcupineWorkerFactory | null>>({ factory: null });
    const [isChunkLoaded, setIsChunkLoaded] = useState(false);
    const [keywords] = useState([
        {
            /** Base64 representation of a trained Porcupine keyword (`.ppn` file) */
            base64: wakeword,
            /** An arbitrary label that you want Porcupine to report when the detection occurs */
            custom: 'start call',
            /** Value in range [0,1] that trades off miss rate for false alarm */
            sensitivity: 0.7
        }]);
    const history = useHistory();
    useEffect(() => {
        async function loadPorcupine() {
            // Dynamically import the worker
            const ppnEnFactory = (await import("@picovoice/porcupine-web-en-worker"))
                .PorcupineWorkerFactory;
            console.log("Porcupine worker (EN) chunk is loaded.");
            return ppnEnFactory;
        }

        if (workerChunk.factory === null) {
            loadPorcupine().then((workerFactory) => {
                setWorkerChunk({ factory: workerFactory });
                setIsChunkLoaded(true);
            });
        }
    }, [workerChunk]);

    const keywordEventHandler = (porcupineKeywordLabel: string) => {
        setKeywordDetections((x) => [...x, porcupineKeywordLabel]);
        console.log(porcupineKeywordLabel)
        let audio = new Audio('./start_call.m4a');
        audio.play();
        firebase.database().ref(`users/${PERSON_TO_CALL}/incoming_call`).set("demo_user_1");
        pause()
        /**
         * Adjust the URLs below:
         * - Match each <ZoomName> (like CarFront) with the corresponding camera index 0-2
         * - for that, you can use the Route /<any-name>/videoAll/<camIndex>, to see which connected camera corresponds to which camera index.
         * - just replace the 0 in the links below with the correct numbers
         */
        setTimeout(() => window.open('http://localhost:3000/CarFront/no-video/0', '_blank'), 0);
        setTimeout(() => window.open('http://localhost:3000/CarPortrait/no-video/2', '_blank'), 9000);
        setTimeout(() => window.open('http://localhost:3000/CarOverview/video/3', '_blank'), 18000);
    };

    const {
        isLoaded,
        isListening,
        isError,
        errorMessage,
        start,
        resume,
        pause,
    } = usePorcupine(
        PorcupineWorkerFactory,
        { keywords, start: true },
        keywordEventHandler
    );

    return (
        <div className="logo-div">
            <div className="logo-box">
                <img className="logo" src={logo}></img>
            </div>
        </div>
    );
}
