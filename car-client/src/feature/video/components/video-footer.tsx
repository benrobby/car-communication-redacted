import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  MutableRefObject,
} from 'react';
import classNames from 'classnames';
import { message } from 'antd';
import ZoomContext from '../../../context/zoom-context';
import CameraButton from './camera';
import MicrophoneButton from './microphone';
import ScreenShareButton from './screen-share';
import ZoomMediaContext from '../../../context/media-context';
import { useUnmount } from '../../../hooks';
import './video-footer.scss';
import { useParams } from 'react-router-dom';
import { UrlParamTypes } from './UrlParamTypes';
interface VideoFooterProps {
  className?: string;
  shareRef?: MutableRefObject<HTMLCanvasElement | null>;
  sharing?: boolean;
  startAudio?: boolean;
}
const isAudioEnable = typeof AudioWorklet === 'function';
const isShareEnable =
  typeof (navigator.mediaDevices as any).getDisplayMedia === 'function';
const VideoFooter = (props: VideoFooterProps) => {
  const urlParams = useParams<UrlParamTypes>();
  const { className, shareRef, sharing, startAudio } = props;
  const [isStartedAudio, setIsStartedAudio] = useState(false);
  const [isStartedVideo, setIsStartedVideo] = useState(false);
  const [isStartedScreenShare, setIsStartedScreenShare] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { mediaStream } = useContext(ZoomMediaContext);
  const zmClient = useContext(ZoomContext);
  const onCameraClick = useCallback(async () => {
    if (isStartedVideo) {
      await mediaStream?.stopVideo();
      setIsStartedVideo(false);
    } else {
      const camIndex = parseInt(urlParams.camId) || 0
      console.log(mediaStream?.getCameraList())
      const usedCamId = mediaStream?.getCameraList()[camIndex].deviceId;
      const captureOptions = {
        cameraId: usedCamId,
        captureWidth:640, 
        captureHeight:360
      }
      await mediaStream?.startVideo(captureOptions);
      setIsStartedVideo(true);
    }
  }, [mediaStream, isStartedVideo]);
  const onMicrophoneClick = useCallback(async () => {
    console.log('trigger mic click')
    if (isStartedAudio) {
      if (isMuted) {
        console.log('unmute audio!')
        await mediaStream?.unmuteAudio();
        setIsMuted(false);
      } else {
        console.log('mute audio!')
        await mediaStream?.muteAudio();
        setIsMuted(true);
      }
    } else {
      console.log('start first audio!')
      await mediaStream?.startAudio();
      setIsStartedAudio(true);
      setTimeout( function (){
        console.log('prep unmute')
        mediaStream?.unmuteAudio()
        setIsMuted(false)
        console.log('now audio should be started!')
      }, 5000);
    }
  }, [mediaStream, isStartedAudio, isMuted]);
  const onHostAudioMuted = useCallback((payload) => {
    const { action, source, type } = payload;
    if (action === 'join' && type === 'computer') {
      setIsStartedAudio(true);
    } else if (action === 'leave') {
      setIsStartedAudio(false);
    } else if (action === 'muted') {
      setIsMuted(true);
      if (source === 'passive(mute one)') {
        message.info('Host muted you');
      }
    } else if (action === 'unmuted') {
      setIsMuted(false);
      if (source === 'passive') {
        message.info('Host unmuted you');
      }
    }
  }, []);
  const onScreenShareClick = useCallback(async () => {
    if (!isStartedScreenShare && shareRef && shareRef.current) {
      await mediaStream?.startShareScreen(shareRef.current);
      setIsStartedScreenShare(true);
    } else if (isStartedScreenShare) {
      await mediaStream?.stopShareScreen();
      setIsStartedScreenShare(false);
    }
  }, [mediaStream, isStartedScreenShare, shareRef]);
  const onPassivelyStopShare = useCallback(({ reason }) => {
    console.log('passively stop reason:', reason);
    setIsStartedScreenShare(false);
  }, []);
  useEffect(() => {
    // change name to URL param
    zmClient.changeName(urlParams.zoomName);     
    // automatically start camera after 5 sec, as zoom sdk needs some time to initialize
    setTimeout(onCameraClick, 5000);
    console.log('start audio is', startAudio)
    if (startAudio) {
      console.log('start audio do now')
      setTimeout(onMicrophoneClick, 10000);
    }
    zmClient.on('current-audio-change', onHostAudioMuted);
    zmClient.on('passively-stop-share', onPassivelyStopShare);
    return () => {
      zmClient.off('current-audio-change', onHostAudioMuted);
      zmClient.off('passively-stop-share', onPassivelyStopShare);
    };
  }, [zmClient, onHostAudioMuted, onPassivelyStopShare]);
  useUnmount(() => {
    if (isStartedAudio) {
      mediaStream?.stopAudio();
    }
    if (isStartedVideo) {
      mediaStream?.stopVideo();
    }
    if (isStartedScreenShare) {
      mediaStream?.stopShareScreen();
    }
  });
  return (
    <div className={classNames('video-footer', className)}>
      {isAudioEnable &&<MicrophoneButton
        isStartedAudio={isStartedAudio}
        isMuted={isMuted}
        onMicrophoneClick={onMicrophoneClick}
      />}
      <CameraButton isStartedVideo={isStartedVideo} onCameraClick={onCameraClick} />
      {sharing &&isShareEnable&& (
        <ScreenShareButton
          isStartedScreenShare={isStartedScreenShare}
          onScreenShareClick={onScreenShareClick}
        />
      )}
    </div>
  );
};
export default VideoFooter;
