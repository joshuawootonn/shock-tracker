import React, { Component } from "react";
import "./styles/styles.css";
import MyMapComponent from "./components/myMapComponent";
import SearchWidget from "./components/seachWidget";
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lat: 41.6611,
      lng: -91.5302,
      radius: 100
    };
  }
  search = () => {};
  default = () => {};

  render() {
    return (
      <div>
        <SearchWidget search={this.search} default={this.default} />

        <MyMapComponent
          isMarkerShown
          lng={this.state.lng}
          lat={this.state.lat}
          radius={this.state.radius}
        />
      </div>
    );
  }
}

export default App;
