import { Button, Tooltip } from "antd";
import { EnvironmentFilled, EnvironmentOutlined } from "@ant-design/icons";
import React from "react";
import "./video-screen-map-button.scss";

interface VideoScreenMapButtonProps {
    mapIsShown: boolean;
    onButtonClick: () => void;
}

const VideoScreenMapButton = (props: VideoScreenMapButtonProps) => {
    const { mapIsShown, onButtonClick } = props;

    const tooltipText = mapIsShown ? "hide map" : "show map";

    return (
        <Tooltip title={tooltipText}>
            <Button
                className="video-screen-map-button"
                icon={mapIsShown ? <EnvironmentOutlined/> : <EnvironmentFilled/>}
                ghost
                shape="circle"
                size="large"
                onClick={onButtonClick}
            />
        </Tooltip>
    )
}

export default VideoScreenMapButton;