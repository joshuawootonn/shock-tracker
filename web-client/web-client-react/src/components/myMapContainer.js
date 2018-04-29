import React, { Component } from "react";
import MyMapComponent from "./myMapComponent";
import { Marker } from "react-google-maps";
import icon1 from "../images/dot-1.png";
import icon2 from "../images/dot-2.png";
import icon3 from "../images/dot-3.png";
import icon4 from "../images/dot-4.png";
import icon5 from "../images/dot-5.png";
import icon6 from "../images/dot-6.png";
import icon7 from "../images/dot-7.png";
import icon8 from "../images/dot-8.png";
import icon9 from "../images/dot-9.png";
import icon10 from "../images/dot-10.png";

const icons = [icon1,icon2,icon3,icon4,icon5,icon6,icon7,icon8,icon9,icon10];
class MyMapContainer extends Component {
  render() {
    const { sessions, radius, lng, lat } = this.props;
    let markers = [];
    if (sessions.length) {
      sessions.forEach(element => {       
        const arr = element.data;
        const temp = arr.map((ele, i) => {
          const speedIndex = Math.round(ele.speed_score*10)-1;
          const accelerationIndex = Math.round(ele.accel_score*10)-1;
          let icon;
          if(this.props.checked === "speed" && ele.speed_score)
            icon =  icons[speedIndex];
          else if (this.props.checked === "acceleration" && ele.accel_score)
            icon =  icons[accelerationIndex];
          else
            icon =  icon1;
          return (
            <Marker
              key={ele.id}
              icon={
               icon
              }
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
    if (radius < 1) zoom = 13;

    return <MyMapComponent lng={lng} lat={lat} markers={markers} zoom={zoom} />;
  }
}

export default MyMapContainer;
