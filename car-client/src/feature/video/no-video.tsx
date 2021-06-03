import React, { useContext, useRef } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import VideoFooter from './components/video-footer';
import './video.scss';
import logo from '../../img/final_logo_black.png';

const NoVideoContainer: React.FunctionComponent<RouteComponentProps> = (props) => {
  const selfShareRef = useRef<HTMLCanvasElement | null>(null);
  return (
    <div className="logo-div">
      <div className="logo-box">
        <img className="logo" src={logo}></img>
      </div>
      <VideoFooter className="video-operations" sharing shareRef={selfShareRef} />
    </div>
  );
};

export default NoVideoContainer;
