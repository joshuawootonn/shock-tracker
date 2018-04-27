import React, { Component } from "react";
import MyMapComponent from "./myMapComponent";
import { Marker } from "react-google-maps";

class MyMapContainer extends Component {
  render() {
    const { sessions, radius, lng, lat } = this.props;
    let markers = [];
    if (sessions.length) {
      sessions.forEach(element => {
        const arr = Object.keys(element.data).map(function(key) {
          return element.data[key];
        });
        const temp = arr.map((ele, i) => {
          return (
            <Marker
              key={ele.id}
              position={{ lat: ele.latitude, lng: ele.longitude }}
            />
          );
        });
        markers = [...markers, temp];
      });
    }
    let zoom = 5;
    if (radius < 1000) zoom = 6;
    if (radius < 500) zoom = 7;
    if (radius < 200) zoom = 8;
    if (radius < 100) zoom = 9;

    if (radius < 50) zoom = 10;
    if (radius < 25) zoom = 11;
    if (radius < 10) zoom = 12;
    if (radius < 5) zoom = 13;
    if (radius <1) zoom = 13;

    return <MyMapComponent lng={lng} lat={lat} markers={markers} zoom={zoom} />;
  }
}

export default MyMapContainer;
