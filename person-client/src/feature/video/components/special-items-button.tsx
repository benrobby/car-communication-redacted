import { Button, Tooltip } from "antd";
import { CarOutlined, VideoCameraOutlined, } from "@ant-design/icons";
import React from "react";
import "./special-items-button.scss";

interface SpecialItemsButtonProps {
  specialItemsShown: boolean;
  onButtonClick: () => void;
}

const SpecialItemsButton = (props: SpecialItemsButtonProps) => {
  const { specialItemsShown, onButtonClick } = props;

  const tooltipText = specialItemsShown ? "show additional info" : "show only video";

  return (
    <Tooltip title={tooltipText}>
      <Button
        className="special-items-button"
        icon={specialItemsShown ? <CarOutlined/> :  <CarOutlined/>}
        ghost
        shape="circle"
        size="large"
        onClick={onButtonClick}
        />
    </Tooltip>
  )
}

export default SpecialItemsButton;
