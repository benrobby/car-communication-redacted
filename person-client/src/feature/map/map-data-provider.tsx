/* eslint-disable no-restricted-globals */
import React, { useState } from 'react';
import './map-data-provider.scss';
import {FirebaseDatabaseNode} from "@react-firebase/database";
import "firebase/database";
import HereMap from "./here-map";
import classnames from "classnames";

interface MapProps {
    showMap: boolean;
    style: { [key: string]: string };
}


const location_hpi = "52.392451,13.125083";
const location_sanssouci = "52.404854,13.038334";
const location_palais = "52.406234,13.015016";

const MapDataProvider = (props: MapProps) => {
    const {showMap, style} = props;

    const urlArgs: { [p: string]: string } = Object.fromEntries(new URLSearchParams(location.search));
    const [currentCar, setCurrentCar] = useState<string>(urlArgs.topic);

    return (
        <div
          className={classnames("map-data-provider", {"map-is-showing": showMap})}
          style={style}
        >
            <FirebaseDatabaseNode
              path={`cars/${currentCar}`}
            >
                {currentCar => {

                    if (currentCar.value == null || currentCar.value.current_coord == null) {
                        return null;
                    }

                    return (<HereMap
                      carLocation={currentCar.value.current_coord}
                      carSpeed={currentCar.value.speed == null ? 0 : currentCar.value.speed}
                      targetLocation={currentCar.value.current_target_coord == null ? location_hpi : currentCar.value.current_target_coord}
                    />);
                }}
            </FirebaseDatabaseNode>


        </div>
    );
};


export default MapDataProvider;
