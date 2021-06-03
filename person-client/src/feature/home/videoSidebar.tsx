import React, { useRef } from 'react';
import { slide as Menu } from 'react-burger-menu';
import Webcam from "react-webcam";
import "./videoSidebar.scss";
import { IconButton } from "@material-ui/core";
import CallEndRoundedIcon from '@material-ui/icons/CallEndRounded';
import VideocamRoundedIcon from '@material-ui/icons/VideocamRounded';
import { useContainerDimensions } from "../../hooks/useContainerDimensions";

const videoConstraints = {
  width: { min: 480 },
  height: { min: 720 },
  aspectRatio: 0.6666666667,
  facingMode: "user",
};

interface IVideoSidebarProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  menuWidth: number;
  incomingCaller: string | "";
  acceptCall: () => void;
  declineCall: () => void;
}

const VideoSidebar = (props: IVideoSidebarProps) => {
  const { menuOpen, setMenuOpen, incomingCaller, menuWidth, acceptCall, declineCall } = props;

  const webcamRef = useRef(null);
  const dimensions = useContainerDimensions(webcamRef);
  const { width } = dimensions;

  const buttonSize = Math.max(width * 0.13, 64);
  const buttonDistance = Math.max((width - 2 * buttonSize) * 0.4, 100);


  return (
    <Menu
      noOverlay
      width={menuWidth}
      pageWrapId={"backgroundPhoto"}
      outerContainerId={'outer-container'}
      isOpen={menuOpen}
      onClose={() => setMenuOpen(false)}
    >
      <div
        className="selfView"
      >
        {
          incomingCaller !== "" &&
          (<div className={"callingScreen"}>
            <div className={"callerInfo"}>
              <div style={{ fontWeight: "bold" }}>
                {incomingCaller}
              </div>
              <div>
                Car Video
              </div>
            </div>
            <div className={"callButtons"}>
              <IconButton className={"declineButton"} style={{ marginRight: `${buttonDistance}px` }} color="primary"
                          aria-label="Decline" component="span" onClick={declineCall}>
                <CallEndRoundedIcon style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }} fontSize="large"/>
              </IconButton>
              <IconButton className={"acceptButton"} color="primary" aria-label="Accept" component="span"
                          onClick={acceptCall}>
                <VideocamRoundedIcon style={{ width: `${buttonSize}px`, height: `${buttonSize}px` }} fontSize="large"/>
              </IconButton>
            </div>
            <div style={{marginTop: "20px"}}>
              Video Preview
            </div>
          </div>)
        }
        <div className={"webcamSizeMeasurement"} ref={webcamRef}>
          <Webcam
            audio={false}
            mirrored={true}
            videoConstraints={videoConstraints}
            height={"100%"}/>
        </div>
      </div>
    </Menu>
  );
};

export default VideoSidebar;
