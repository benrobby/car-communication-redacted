import { Button } from "antd";
import React, { useCallback } from "react";
import { useHistory } from "react-router-dom";
import "./leave-button.scss";

interface ILeaveButtonProps {
  onLeave: () => void;
}

const LeaveButton = (props: ILeaveButtonProps) => {

  const {onLeave} = props;

  const history = useHistory();

  const onButtonClick = useCallback(async () => {
    await onLeave();
    history.push("/");
  }, [history, onLeave]);
  return (
    <Button
      className="leave-button"
      type="primary"
      danger
      shape="round"
      size="large"
      onClick={onButtonClick}
    >
      Leave
    </Button>
  )
}

export default LeaveButton;
