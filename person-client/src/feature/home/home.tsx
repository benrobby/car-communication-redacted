/* eslint-disable no-restricted-globals */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Card } from 'antd';
import './home.scss';
import { disableBodyScroll } from "body-scroll-lock";
import SideBar from "./sideBar";
import PresenceNavbar from "./presenceNavbar";
import VideoSidebar from "./videoSidebar";
import { useContainerDimensions } from "../../hooks/useContainerDimensions";
import firebase from "firebase/app";

export interface IContact {
  key: string;
  icon: string;
  title: string;
  topic: string;
  description: string;
}


const mergeUrlParams = (additionalParams: string): string => {
  let urlArgs: { [p: string]: string } = {
    ...Object.fromEntries(new URLSearchParams(location.search)),
    ...Object.fromEntries(new URLSearchParams(additionalParams)),
  };
  return new URLSearchParams(urlArgs).toString();
}

const { Meta } = Card;
const Home: React.FunctionComponent<RouteComponentProps> = (props) => {
  const { history } = props;
  const pushHistory = (type: string, additionalUrlParam: string = "") => {
    history.push(`/${type}?&${mergeUrlParams(additionalUrlParam)}`);
  };
  // @ts-ignore
  disableBodyScroll(document);

  const backgroundElementRef = useRef(null);
  const { width } = useContainerDimensions(backgroundElementRef);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [incomingCaller, setIncomingCaller] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<string>("DEMO_USER");

  useEffect(() => {
    const incomingCallsRef = firebase.database().ref(`users/${currentUser}/incoming_call`);
    incomingCallsRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data != null && data !== "") {
        setMenuOpen(true);
        setIncomingCaller(data);
      }
    });
    return () => incomingCallsRef.off();
  }, []);

  const declineCall = useCallback(async () => {
    if (incomingCaller == null || incomingCaller === "") {
      return;
    }
    await firebase.database().ref(`users/${currentUser}/incoming_call`).set({});
    setIncomingCaller("");
    setMenuOpen(false);
  }, [currentUser, incomingCaller]);

  const acceptCall = useCallback(async () => {
    if (incomingCaller == null || incomingCaller === "") {
      return;
    }
    firebase.database().ref(`users/${incomingCaller}/car`).get()
      .then((snapshot) => {
        if (snapshot.exists()) {
          const topic = snapshot.val();
          declineCall();
          pushHistory("video", `?&topic=${topic}`);
        }
      }).catch((error) => {
      console.error(error);
    });
  }, [currentUser, incomingCaller, declineCall]);

  const showVideo = () => {
    setMenuOpen(!menuOpen);
  };
  const unfoldVideo = () => {
    setMenuOpen(true);
  }
  return (
    <div id={"outer-container"} className={"homePage"}>
      <PresenceNavbar showVideo={showVideo}/>
      <div className={"content"}>
        <VideoSidebar setMenuOpen={setMenuOpen} menuOpen={menuOpen} incomingCaller={incomingCaller} acceptCall={acceptCall} declineCall={declineCall} menuWidth={width}/>
        <div ref={backgroundElementRef} id={"backgroundPhoto"} className={"background"}>
          <img src="./logo_car.svg" alt="Logo"/>
          <div className={"backgroundText"}>
            Select a contact on the right to start a call
          </div>
        </div>


        <SideBar pushHistory={pushHistory} unfoldVideo={unfoldVideo}/>
      </div>
    </div>
  );
};
export default Home;
