import React, { Component } from "react";
import MyMapComponent from "./myMapComponent";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";

class MyMapContainer extends Component {
  render() {
    const { sessions } = this.props;
    let markers = [];
    if (sessions.length) {
      sessions.forEach(element => {
        const arr = Object.keys(element.data).map(function(key) {
          return element.data[key];
        });
        const temp = arr.map((ele, i) => {
          return (
            <Marker key={ele.id} position={{ lat: ele.latitude, lng: ele.longitude }} />
          );
        });
        markers = [...markers,temp];
      });
    }

    return (
      <MyMapComponent
        lng={this.props.lng}
        lat={this.props.lat}
        markers={markers}
      />
    );
  }
}

export default MyMapContainer;
