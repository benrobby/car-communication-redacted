import LocationOnIcon from '@material-ui/icons/LocationOn';
import "./carListItem.scss";
import ProfileAvatar from "./ProfileAvatar";
import { IconButton, ListItem, ListItemSecondaryAction } from "@material-ui/core";
import useWindowDimensions from "../../hooks/useWindowDimension";
import React, { useRef, useState } from "react";
import VideocamIcon from "@material-ui/icons/Videocam";

interface CarListItemProps {
  name: string;
  targetDescription: string;
  currentPassengers: string[];
  driving: boolean;
  id: string;
  onVideoClick: (type: string, additionalUrlParam: string) => void;
  unfoldVideo: () => void;
}

const CarListItem = (props: CarListItemProps) => {
  const { name, targetDescription, currentPassengers, driving, id, onVideoClick, unfoldVideo } = props;

  // todo compute eta

  const notOnlineRef = useRef<any>(null);
  const callMessageRef = useRef<any>(null);

  return (
    <div className={"carListItem"}>
      <ListItem button onClick={
        () => {
          if (driving) {
            onVideoClick("video", `?&topic=${id}`);
          } else {
            const r = notOnlineRef.current;
            if (r != null) {
              r.className = "notOnlineMessage messageShown";
              console.log(r.offsetHeight);
              r.className = "notOnlineMessage messageFadeout";
            }
          }
        }
      } dense={true}>
        <div className={"car"}>
          <img style={{
            height: `${100 * useWindowDimensions().height / 1500}px`,
            width: `${100 * useWindowDimensions().height / 1500}px`,
          }} src={"./hyundai_car_front.png"}/>

          <div className={"passengers"}>
            {currentPassengers?.length > 0 &&
            currentPassengers.map(id =>
              <ProfileAvatar key={id} picturePath={`./${id}.jpeg`} size={48} online={true} adjustSize={true}/>,
            )
            }
          </div>
        </div>
        <div className={"carInfo"}>
          <div className={"carName"}>{name}</div>
          <div className={"carLocation"} style={{ marginTop: `${6 * useWindowDimensions().height / 1500}%` }}>
            <LocationOnIcon style={{
              color: driving ?
                "rgb(27,181,58)" :
                "grey",
            }}/>
            {driving ? `12 min to ${targetDescription}` : targetDescription}
          </div>
        </div>
        <div ref={callMessageRef} className={"callMessage"}>
          call
        </div>
        <div ref={notOnlineRef} className={"notOnlineMessage"}>
          not online
        </div>
        {driving &&
          <ListItemSecondaryAction>
            <IconButton color="inherit" aria-label="start call" component="span" onClick={() => onVideoClick("video", `?&topic=${id}`)}>
              <VideocamIcon
                style={{fill: "#32b945"}}
                fontSize={"large"}
                color={"inherit"}/>
            </IconButton>
          </ListItemSecondaryAction>
        }
      </ListItem>
    </div>
  );
}

export default CarListItem;
