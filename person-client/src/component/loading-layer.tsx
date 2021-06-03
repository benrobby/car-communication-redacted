import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import './loading-layer.scss';


const LoadingLayer = (props: { content: any }) => {
  const { content } = props;
  return (
    <div className="loading-layer">
      <div className="logo-div" style={{display: "flex", flexDirection: "column", alignItems: "center", marginTop: "100px", justifyContent: "center"}}>
        <div className="logo-box" style={{width: "50%", marginBottom: "15%" }}>
          <img src="./logo_both.svg" alt="Logo" />
        </div>
        <LoadingOutlined style={{ fontSize: '86px', color: '#000' }} />
      </div>
    </div>
  );
};

export default LoadingLayer;
