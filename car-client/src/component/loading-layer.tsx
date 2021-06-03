import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import './loading-layer.scss';
import logo from '../img/final_logo_black.png';


const LoadingLayer = (props: { content: any }) => {
  const { content } = props;
  return (
    <div className="logo-div">
      <div className="logo-box">
        <img className="logo" src={logo}></img>
      </div>
      <div className="loading-layer">
        <LoadingOutlined style={{ fontSize: '86px', color: '#000' }} />
      </div>
    </div>
  );
};

export default LoadingLayer;
