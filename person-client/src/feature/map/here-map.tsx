import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import classnames from "classnames";
import ChatContext from "../../context/chat-context";


const HEREAPIKEY = "REDACTED";

declare global {
  interface Window {
    H:any;
  }
}

export interface IHereMapProps {
  targetLocation: string;
  carLocation: string;
  carSpeed: number;
}

const HereMap = (props: IHereMapProps) => {

  const {targetLocation, carLocation, carSpeed} = props;

  const [originLocation, setOriginLocation] = useState<string>(carLocation);

  // Create a reference to the HTML element we want to put the map on
  const mapRef = useRef(null);
  // eta is the estimated time of arrival in minutes
  const [eta, setEta] = useState(0);
  // send notification once when there are 3 minutes time left until arrival
  const [notificationStatus, setNotificationStatus] =useState<string>("none");
  const chatClient = useContext(ChatContext);

  const carSVG = '<svg xmlns="http://www.w3.org/2000/svg"\n' +
      'width="35" height="42" viewBox="0 0 742.000000 426.000000">\n' +
      '<g transform="translate(0.000000,426.000000) scale(0.100000,-0.100000)">\n' +
      '<path d="M2720 4079 c-1457 -95 -2369 -849 -2560 -2117 -43 -280 -37 -724 11\n' +
      '-831 50 -114 194 -203 426 -265 l87 -23 27 -74 c99 -281 306 -477 596 -566 78\n' +
      '-23 104 -26 233 -26 118 0 160 4 225 22 91 24 202 75 272 122 150 103 289 284\n' +
      '339 444 l18 55 1388 0 c1314 0 1389 -1 1394 -17 47 -145 122 -272 224 -373\n' +
      '156 -156 353 -244 575 -257 403 -23 780 243 890 628 l18 64 79 23 c95 26 215\n' +
      '75 260 106 76 50 117 161 125 336 15 317 -117 635 -372 899 -294 305 -759 526\n' +
      '-1350 641 -67 14 -58 5 -358 323 -256 271 -482 440 -792 593 -489 241 -1070\n' +
      '338 -1755 293z m745 -359 c770 -70 1269 -356 1529 -877 62 -124 60 -164 -7\n' +
      '-200 -30 -17 -90 -18 -817 -21 -547 -2 -796 0 -822 8 -25 7 -43 20 -52 38 -15\n' +
      '29 -39 183 -81 522 -14 113 -35 263 -45 334 -24 156 -24 170 -4 190 19 19 130\n' +
      '21 299 6z m-761 -14 c24 -10 37 -24 44 -48 27 -84 116 -957 102 -994 -5 -12\n' +
      '-18 -28 -29 -33 -13 -8 -234 -11 -683 -11 -541 0 -676 3 -732 15 -86 18 -126\n' +
      '41 -151 87 -18 33 -18 42 -7 94 6 32 34 104 61 159 189 386 578 643 1091 719\n' +
      '95 14 139 19 238 24 18 1 48 -4 66 -12z m-1013 -2196 c203 -69 330 -243 331\n' +
      '-455 2 -224 -136 -407 -351 -467 -170 -47 -337 -2 -467 127 -219 217 -177 576\n' +
      '87 746 109 70 277 90 400 49z m4533 -23 c174 -83 276 -244 276 -438 1 -422\n' +
      '-504 -635 -811 -342 -264 251 -161 689 189 804 45 15 79 18 163 16 98 -3 112\n' +
      '-6 183 -40z"/>\n' +
      '</g>\n' +
      '</svg>';

  const carIcon = new window.H.map.Icon(carSVG);
  const [carMarker, setCarMarker] = useState(new window.H.map.Marker({lat: 52.0, lng: 13.0}, {icon: carIcon}));


  // Create the parameters for the routing request:
  const routingParameters = {
    routingMode: 'fast',
    transportMode: 'car',
    origin: originLocation,
    destination: targetLocation,
    return: 'polyline'
  };

  // `useEffect` could also be used here, `useLayoutEffect` will render the map sooner
  useLayoutEffect(() => {
    // `mapRef.current` will be `undefined` when this hook first runs; edge case that
    if (!mapRef.current) return;

    const H = window.H;
    const platform = new H.service.Platform({
      apikey: HEREAPIKEY
    });
    const defaultLayers = platform.createDefaultLayers();
    const hMap = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      center: { lat: 50, lng: 5 },
      zoom: 4,
      pixelRatio: window.devicePixelRatio || 1,
      padding: {top: 50, left: 50, bottom: 50, right: 50}
    });

    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(hMap));
    const ui = H.ui.UI.createDefault(hMap, defaultLayers);

    // Define a callback function to process the routing response:
    const onResult = (result: any) => {
      // ensure that at least one route was found
      if (result.routes.length) {
        result.routes[0].sections.forEach((section: any) => {
          // Create a linestring to use as a point source for the route line
          const linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
          const startMarker = new H.map.Marker(section.departure.place.location);
          const endMarker = new H.map.Marker(section.arrival.place.location);

          // Create an outline for the route polyline:
          const routeOutline = new H.map.Polyline(linestring, {
            style: {
              lineWidth: 10,
              strokeColor: 'rgba(0, 128, 255, 0.7)',
              lineTailCap: 'arrow-tail',
              lineHeadCap: 'arrow-head'
            }
          });
          // Create a patterned polyline:
          const routeArrows = new H.map.Polyline(linestring, {
              style: {
                lineWidth: 10,
                fillColor: 'white',
                strokeColor: 'rgba(255, 255, 255, 1)',
                lineDash: [0, 2],
                lineTailCap: 'arrow-tail',
                lineHeadCap: 'arrow-head' }
            }
          );
          // create a group that represents the route line and contains outline and the pattern
          const routeLine = new H.map.Group();
          routeLine.addObjects([routeOutline, routeArrows]);

          // Add the route polyline and the two markers to the map:
          hMap.addObjects([routeLine, startMarker, endMarker]);

          // Set the map's viewport to make the whole route visible:
          hMap.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
        });
      }
    };

    // Get an instance of the routing service version 8:
    const router = platform.getRoutingService(null, 8);

    router.calculateRoute(routingParameters, onResult,
      (error: any) => {
        console.error(error.message + "error when calculating route");
      });

    hMap.addObject(carMarker);

    return () => {
      hMap.dispose();
    };
  }, [mapRef]);

  useEffect(() => {
    if (carMarker) {
      const val = carLocation;
      if (val != null) {
        const [latitude, longitude] = val.split(',');
        carMarker.setGeometry({lat: latitude, lng: longitude});
      }
    }
  }, [carLocation]);

  const etaRoutingParameters = {
    routingMode: 'fast',
    transportMode: 'car',
    origin: originLocation,
    destination: targetLocation,
    return: 'summary'
  };
  //calculate and update ETA
  useEffect(() => {
    const platform = new window.H.service.Platform({ apikey: HEREAPIKEY });
    const onResult = (result : any) => {
      // ensure that at least one route was found
      if (result.routes.length) {
        result.routes[0].sections.forEach((section : any) => {
          if(section.summary) {
            const etaInMinutes = Math.round(section.summary.duration / 60);
            setEta(etaInMinutes);
          }
        });
      }
    };
    const router = platform.getRoutingService(null, 8);
    etaRoutingParameters.origin = carLocation;
    router.calculateRoute(etaRoutingParameters, onResult,
      (error : any) => {
        console.error(error.message + "error when calculating ETA");
      });
  }, [carLocation]);

  useEffect(() => {
    if(eta != 0 && eta <= 3 && notificationStatus == "none") {
      // sendToAll() somehow does not work, we use userId 0 for now, this seems to be everyone in the chat
      chatClient?.send("The car arrives in about 3 minutes.", 0);
      setNotificationStatus("close_to_target");
    }
  }, [eta]);

  return (
    <div
      className={classnames("map-here")}
      ref={mapRef}
    >
      <p className = "overlayCarInfo">
        Expected arrival in {eta} minutes! <br/>
        Current Speed: {carSpeed} km/h
      </p>
    </div>
  )
}

export default HereMap;
