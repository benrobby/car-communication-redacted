import { Nav, Navbar } from "react-bootstrap";
import Clock from "react-live-clock";
import ProfileAvatar from "./ProfileAvatar";
import React from "react";
import { IconButton } from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import VideocamIcon from "@material-ui/icons/Videocam";
import "./presenceNavbar.scss";

interface IPresenceNavbarProps {
  showVideo: () => void;
}

const PresenceNavbar = (props: IPresenceNavbarProps) => {
  const {showVideo} = props;

  return (
    <Navbar bg="white" variant="light">
      <Nav className="mr-auto">
        <Navbar.Brand href="">
          <img
            style={{
              marginLeft: "24px"
            }}
            alt=""
            src="/logo_text.svg"
            height="64"
            className="d-inline-block align-top"
          />{' '}
        </Navbar.Brand>
      </Nav>
      <Clock ticking={true} interval={10 * 1000}/>
      <div className={"verticalLine"}/>
      <Clock ticking={true} interval={10 * 1000} format={"MMM Do"}/>
      <ProfileAvatar showVideo={showVideo} picturePath={"./DEMO_USER.jpeg"} size={120} online={true} adjustSize={false}/>
    </Navbar>
  );
}

export default PresenceNavbar;
