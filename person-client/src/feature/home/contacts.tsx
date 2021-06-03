import React, { useState } from "react";
import { List, makeStyles } from "@material-ui/core";
import "./contacts.scss";
import { FirebaseDatabaseNode } from "@react-firebase/database";
import ContactListItem from "./contactListItem";
import useWindowDimensions from "../../hooks/useWindowDimension";

interface IContactsProps {
  onVideoClick: (type: string, additionalUrlParam: string) => void;
  unfoldVideo: () => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: "transparent",
    "&.Mui-selected": {
      backgroundColor: "transparent"
    },
    "@media (hover: none)": {
      '&:hover': {
        backgroundColor: "transparent",
      },
    },
  },
}));

interface IUser {
  name: string;
  contacts: string[];
  car: string;
  home_coord: string;
  work_coord: string;
  online: boolean;
}


const Contacts: React.FunctionComponent<IContactsProps> = (props) => {
  const { onVideoClick, unfoldVideo } = props;

  const [contactListLength, setContactListLength] = useState<number>(20);
  const [currentUser, setCurrentUser] = useState<string>("DEMO_USER");
  const classes = useStyles();
  const {height} = useWindowDimensions();

  return (
    <div className="contacts" style={{marginTop: `${8 * height / 1500}%`}}>
      <h2>Contacts</h2>

      <div className={"contacts-list"}>
          <FirebaseDatabaseNode
            path={`users`}
            limitToFirst={contactListLength}
          >
            {({value}) => {
              if (value == null) {
                return null;
              }

              let users: Array<[string, IUser]> = Object.entries(value);
              users = users.filter(u => u[0] !== currentUser);
              users = users.sort((a, b) => Number(b[1].online) - Number(a[1].online));

              return (
                <List className={classes.root}>

                {users.map(([userId, user]) => (
                    <ContactListItem key={userId} id={userId} name={user.name} topic={user.car} online={user.online} onVideoClick={onVideoClick} unfoldVideo={unfoldVideo}/>
                  ))}
                </List>
              );
            }}
          </FirebaseDatabaseNode>
      </div>

    </div>
  )
}


export default Contacts;
