import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { RouteComponentProps } from 'react-router-dom';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import Avatar from './components/avatar';
import VideoFooter from './components/video-footer';
import Pagination from './components/pagination';
import { useCanvasDimension } from './hooks/useCanvasDimension';
import { usePagination } from './hooks/usePagination';
import { useActiveVideo } from './hooks/useAvtiveVideo';
import { useShare } from './hooks/useShare';
import './video.scss';
import { useCarLayout } from "./hooks/useCarLayout";
import ChatContainer from "../chat/chat";
import MapDataProvider from "../map/map-data-provider";
import { ChatRecord } from "../chat/chat-types";

const paginationDisplayNames = [
  ["CarOverview", "CarPortrait", "otherPerson"],
  ["CarFront"]
];

const specialPaginations = [
  "maps",
  "chat",
];

const VideoContainer: React.FunctionComponent<RouteComponentProps> = (props) => {
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady },
  } = useContext(ZoomMediaContext);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const shareRef = useRef<HTMLCanvasElement | null>(null);
  const selfShareRef = useRef<HTMLCanvasElement | null>(null);
  const shareContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const activeVideo = useActiveVideo(zmClient);

  const [hideSpecialItems, setHideSpecialItems] = useState<boolean>(false);
  const [paginationDirty, setPaginationDirty] = useState<boolean>(false);
  const [chatIsShowing, setChatIsShowing] = useState<boolean>(false);
  const [mapIsShowing, setMapIsShowing] = useState<boolean>(false);

  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationMessage, setNotificationMessage] = useState<string>("");

  const specialPaginationItems = [
    {type: "maps", isShowing: mapIsShowing, setIsShowing: setMapIsShowing, },
    {type: "chat", isShowing: chatIsShowing, setIsShowing: setChatIsShowing, },
  ];

  const upperPagination = usePagination(
    zmClient,
    canvasDimension,
    0,
    paginationDisplayNames,
    true
  );

  const lowerPagination = usePagination(
    zmClient,
    canvasDimension,
    1,
    paginationDisplayNames,
    false,
    hideSpecialItems ? 0 : specialPaginationItems.length,
    paginationDirty,
  );

  const onSpecialPaginationItemsToggle = () => {
    if (!hideSpecialItems) {
      lowerPagination.setPage((_: any) => 0);
    }
    setHideSpecialItems(!hideSpecialItems);
    setPaginationDirty(true);
  };

  if (paginationDirty) {
    setPaginationDirty(false);
  }

  const { visibleParticipants, layout: videoLayout, visibleSpecialPaginationItems } = useCarLayout(
    zmClient,
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    canvasDimension,
    upperPagination,
    lowerPagination,
    specialPaginations,
  );


  specialPaginationItems.forEach((item, i) => {
    const visible = visibleSpecialPaginationItems[i];
    if (hideSpecialItems) {
      if (item.isShowing) {
        item.setIsShowing(false);
      }
    } else {
      if (visible != item.isShowing) {
        item.setIsShowing(visible);
      }
    }
  });

  const onChatNotification = useCallback((notification: ChatRecord) => {
    if (notification.sender.userId === zmClient.getCurrentUserInfo().userId) {
      return;
    }
    setNotificationCount(notificationCount + 1);
    if (Array.isArray(notification.message)) {
      if (notification.message.length > 0) {
        setNotificationMessage(notification.message[0]);
      }
    } else {
      setNotificationMessage(notification.message);
    }
  }, [notificationCount, notificationMessage]);
  useEffect(() => {
    setNotificationCount(0);
  }, [chatIsShowing]);

  const { isRecieveSharing, isStartedShare, sharedContentDimension } = useShare(
    zmClient,
    mediaStream,
    shareRef,
  );
  const isSharing = isRecieveSharing || isStartedShare;
  const contentDimension = sharedContentDimension;
  if (isSharing && shareContainerRef.current) {
    const { width, height } = sharedContentDimension;
    const {
      width: containerWidth,
      height: containerHeight,
    } = shareContainerRef.current.getBoundingClientRect();
    const ratio = Math.min(containerWidth / width, containerHeight / height, 1);
    contentDimension.width = Math.floor(width * ratio);
    contentDimension.height = Math.floor(height * ratio);
  }

  const { height: canvasHeight } = canvasDimension;

  return (
    <div className="viewport">
      <div
        className={classnames('share-container', {
          'in-sharing': isSharing,
        })}
        ref={shareContainerRef}
      >
        <div
          className="share-container-viewport"
          style={{
            width: `${contentDimension.width}px`,
            height: `${contentDimension.height}px`,
          }}
        >
          <canvas
            className={classnames('share-canvas', { hidden: isStartedShare })}
            ref={shareRef}
          />
          <canvas
            className={classnames('share-canvas', { hidden: isRecieveSharing })}
            ref={selfShareRef}
          />
        </div>
      </div>
      <div
        className={classnames('video-container', {
          'in-sharing': isSharing,
        })}
      >
        <canvas
          className="video-canvas"
          id="video-canvas"
          width="800"
          height="600"
          ref={videoRef}
        />
        {videoLayout[1] !== undefined &&
        <MapDataProvider
            showMap={mapIsShowing}
            style={{
              width: `${videoLayout[1].width}px`,
              height: `${videoLayout[1].height}px`,
              top: `${canvasHeight - videoLayout[1].y - videoLayout[1].height}px`,
              left: `${videoLayout[1].x}px`,
            }}
        />
        }
        {videoLayout[1] !== undefined &&
        <ChatContainer
            showChat={chatIsShowing}
            style={{
              width: `${videoLayout[1].width}px`,
              height: `${videoLayout[1].height}px`,
              top: `${canvasHeight - videoLayout[1].y - videoLayout[1].height}px`,
              left: `${videoLayout[1].x}px`,
            }}
            onChatMessageCallback={onChatNotification}
        />
        }
        <ul className="avatar-list">
          {visibleParticipants.map((user, index) => {
            if (index > videoLayout.length - 1) {
              return null;
            }
            const dimension = videoLayout[index];
            const { width, height, x, y } = dimension;

            return (
              <Avatar
                participant={user}
                key={user.userId}
                isActive={activeVideo === user.userId}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  top: `${canvasHeight - y - height}px`,
                  left: `${x}px`,
                }}
              />
            );
          })}
        </ul>
      </div>
      <VideoFooter
        className="video-operations"
        sharing={false}
        shareRef={selfShareRef}
        specialItemsToggle={onSpecialPaginationItemsToggle}
        specialItemsShown={hideSpecialItems}
        showSpecialItemsToggle={true}
        mapsPagination={lowerPagination}
        chatIsShown={chatIsShowing}
        setNotificationCount={setNotificationCount}
        notificationCount={notificationCount}
        notificationMessage={notificationMessage}
      />
      {upperPagination.totalPage > 1 && (
        <Pagination
          page={upperPagination.page}
          totalPage={upperPagination.totalPage}
          setPage={upperPagination.setPage}
          inSharing={isSharing}
          isTop={true}
          switchToNextPageAfterTimeout={true}
        />
      )}
      {lowerPagination.totalPage > 1 && (
        <Pagination
          page={lowerPagination.page}
          totalPage={lowerPagination.totalPage}
          setPage={lowerPagination.setPage}
          inSharing={isSharing}
          isTop={false}
          switchToNextPageAfterTimeout={false}
        />
      )}
    </div>
  );
};

export default VideoContainer;
