import CarsList from "./carsList";
import Contacts from "./contacts";
import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText } from "@material-ui/core";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import React from "react";
import "./sideBar.scss";


interface ISideBarProps {
  pushHistory: (type: string, additionalUrlParam: string) => void;
  unfoldVideo: () => void;
}

const SideBar = (props: ISideBarProps) => {
  const {pushHistory, unfoldVideo} = props;

  return (
    <div className={"sidebar"}>
      <CarsList onVideoClick={pushHistory} unfoldVideo={unfoldVideo}/>
      <div className={"horizontalFullLine"}/>
      <Contacts onVideoClick={pushHistory} unfoldVideo={unfoldVideo}/>
      <div className={"addContactButton"}>
        <div className={"horizontalFullLine"}/>
        <List>
          <ListItem button>
            <ListItemText disableTypography primary={"Add new contact"}/>
            <ListItemSecondaryAction>
              <IconButton color="inherit" aria-label="add contact" component="span">
                <PersonAddIcon
                  fontSize={"large"}
                  color={"inherit"} />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </div>
    </div>
  );
}

export default SideBar;
