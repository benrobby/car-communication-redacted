import { Button, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import "./chat-button.scss";
import ChatIconOutlined from '@material-ui/icons/ChatOutlined';
import ChatIcon from '@material-ui/icons/Chat';

interface ChatButtonProps {
  isShown: boolean;
  onClick: () => void;
  notificationCount: number;
  notificationMessage: string;
}

const ChatButton = (props: ChatButtonProps) => {
  const { isShown, onClick, notificationCount, notificationMessage } = props;

  const tooltipText = isShown ? "hide notifications" : "show notifications";
  const textPreviewRef = useRef(null);

  const [nCount, setNCount] = useState(0);

  useEffect(() => {
    if (nCount < notificationCount) {
      const r: any = textPreviewRef.current;
      if (r != null) {
        r.className = "chatNotification messageShown";
        console.log(r.offsetHeight);
        r.className = "chatNotification messageFadeoutChat";
      }
    }
    setNCount(notificationCount)
  }, [notificationCount]);


  return (
    <Tooltip title={tooltipText}>
      <Button
        className="chat-button"
        icon={isShown ? <ChatIconOutlined/> : <ChatIcon/>}
        ghost
        shape="circle"
        size="large"
        onClick={onClick}
      >
          {isShown ? null :
              <div>
                  {
                      <div className={"messageHidden"} ref={textPreviewRef}>
                          <span className="icon-button_badge" > {notificationCount} </span>
                          <div className="speech-bubble"> {notificationMessage} </div>
                      </div>
                  }
              </div>
          }
      </Button>
    </Tooltip>
  )
}

export default ChatButton;
