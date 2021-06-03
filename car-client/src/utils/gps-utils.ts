import firebase from 'firebase/app'
import { CAR_NAME } from '../config/dev'

function storeGPS(position: GeolocationPosition) {
    let pos = position.coords.latitude + ',' + position.coords.longitude;
    firebase.database().ref(`cars/${CAR_NAME}/current_coord`).set(pos);
    if (position.coords.speed != null) {
        firebase.database().ref(`users/${CAR_NAME}/speed`).set(position.coords.speed);
    }
    console.log('stored position', pos);
}

function errorGPS() {
    console.log('error occured while accessing GPS data')
}

const gps_options = {
    enableHighAccuracy: true
}

export function watchGPS() {
    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(storeGPS, errorGPS, gps_options)
    } else {
        console.log('location not available')
    }

};

