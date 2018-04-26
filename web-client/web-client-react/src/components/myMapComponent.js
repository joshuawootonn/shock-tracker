import React from 'react';
import { compose, withProps } from "recompose"
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

const MyMapComponent = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places",
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ position: 'absolute',top: '0', bottom: '0', right: '0', left:'0',zIndex:"-1" }} />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withScriptjs,
  withGoogleMap
)((props) =>


  <GoogleMap
    defaultZoom={11}
    defaultCenter={{ lat: props.lat, lng: props.lng}}
  >
    {props.markers}
  </GoogleMap>
);

export default MyMapComponent;