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
import LeaveButton from "./leave-button";
import ChatButton from "./chat-button";
import { IExtendedPagination } from "../hooks/usePagination";

interface VideoFooterProps {
  className?: string;
  shareRef?: MutableRefObject<HTMLCanvasElement | null>;
  sharing?: boolean;
  specialItemsToggle: () => void;
  specialItemsShown: boolean;
  showSpecialItemsToggle: boolean;
  mapsPagination: IExtendedPagination;
  chatIsShown: boolean;
  setNotificationCount: (count: number) => void;
  notificationCount: number;
  notificationMessage: string;
}

const VideoFooter = (props: VideoFooterProps) => {
  const { className, shareRef, sharing, specialItemsShown, specialItemsToggle , showSpecialItemsToggle, mapsPagination, chatIsShown, setNotificationCount, notificationCount, notificationMessage} = props;
  const [isStartedAudio, setIsStartedAudio] = useState(false);
  const [isStartedVideo, setIsStartedVideo] = useState(false);
  const [isStartedScreenShare, setIsStartedScreenShare] = useState(false);
  const [isMuted, setIsMuted] = useState(true);


  const { mediaStream } = useContext(ZoomMediaContext);
  const zmClient = useContext(ZoomContext);

  const {setPage, totalSize} = mapsPagination;

  const onChatClick = useCallback(() => {
    if (chatIsShown) {
      setPage(0);
    } else {
      setPage(totalSize - 1); // assumes that chat is the last page
    }
    setNotificationCount(0);
  }, [setPage, totalSize, chatIsShown]);

  const onCameraClick = useCallback(async () => {
    if (isStartedVideo) {
      await mediaStream?.stopVideo();
      setIsStartedVideo(false);
    } else {
      await mediaStream?.startVideo();
      setIsStartedVideo(true);
    }
  }, [mediaStream, isStartedVideo]);

  const onLeave = useCallback(async () => {
    if (isStartedVideo) {
      await mediaStream?.stopVideo();
      setIsStartedVideo(false);
    }
  },[mediaStream, isStartedVideo]);

  const onMicrophoneClick = useCallback(async () => {
    if (isStartedAudio) {
      if (isMuted) {
        await mediaStream?.unmuteAudio();
        setIsMuted(false);
      } else {
        await mediaStream?.muteAudio();
        setIsMuted(true);
      }
    } else {
      await mediaStream?.startAudio();
      setIsStartedAudio(true);
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
  useEffect(() => {
    setTimeout(onCameraClick, 1000);
    setTimeout(onMicrophoneClick, 500);
  }, []);
  return (
    <div className={classNames('video-footer', className)}>
      <MicrophoneButton
        isStartedAudio={isStartedAudio}
        isMuted={isMuted}
        onMicrophoneClick={onMicrophoneClick}
      />
      <CameraButton isStartedVideo={isStartedVideo} onCameraClick={onCameraClick} />
      {sharing && (
        <ScreenShareButton
          isStartedScreenShare={isStartedScreenShare}
          onScreenShareClick={onScreenShareClick}
        />
      )}
      <ChatButton isShown={chatIsShown} onClick={onChatClick} notificationCount={notificationCount} notificationMessage={notificationMessage}/>
      <LeaveButton onLeave={onLeave}/>
    </div>
  );
};

export default VideoFooter;
