import { IconButton, ListItem, ListItemSecondaryAction, ListItemText } from "@material-ui/core";
import VideocamIcon from "@material-ui/icons/Videocam";
import React, { useRef, useState } from "react";
import ProfileAvatar from "./ProfileAvatar";
import "./contactListItem.scss";
import useWindowDimensions from "../../hooks/useWindowDimension";

interface ContactListItemProps {
  name: string;
  id: string;
  topic: string;
  online: boolean;
  onVideoClick: (a: string, b: string) => void;
  unfoldVideo: () => void;
}

const ContactListItem = (props: ContactListItemProps) => {
  const { id, name, topic, online, onVideoClick, unfoldVideo } = props;

  const { height } = useWindowDimensions();
  const notOnlineRef = useRef<any>(null);
  const callMessageRef = useRef<any>(null);


  return (
    <div className={"contactListItem"}>
      <ListItem button
                onClick={() => {
                  if (online) {
                    onVideoClick("video", `?&topic=${topic}`)
                  } else {
                    const r = notOnlineRef.current;
                    if (r != null) {
                      r.className = "notOnlineMessage messageShown";
                      console.log(r.offsetHeight);
                      r.className = "notOnlineMessage messageFadeout";
                    }
                  }
                }}
                dense={true}>
        <ProfileAvatar picturePath={`./${id}.jpeg`} size={86} online={online} adjustSize={true}
                       style={{ margin: `${height / 2000}em` }}/>
        <ListItemText disableTypography primary={name}/>
        <div ref={callMessageRef} className={"callMessage"}>
          call
        </div>
        <div ref={notOnlineRef} className={"notOnlineMessage"}>
          not online
        </div>
        {online &&
        <ListItemSecondaryAction>
            <IconButton color="inherit" aria-label="start call" component="span"
                        onClick={() => onVideoClick("video", `?&topic=${topic}`)}>
                <VideocamIcon
                    style={{ fill: "#32b945" }}
                    fontSize={"large"}
                    color={"inherit"}/>
            </IconButton>
        </ListItemSecondaryAction>
        }
      </ListItem>
    </div>
  );
}

export default ContactListItem;
