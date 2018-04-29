import React, { Component } from "react";
import "./styles/styles.css";
import SearchWidget from "./components/seachWidget";
import * as api from "./api";
import MyMapContainer from "./components/myMapContainer";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lat: 41.6611,
      lng: -91.5302,
      radius: 1,
      expanded: true,
      sessions: [],
      status: ""
    };
  }
  componentDidMount = () => {
    this.search();
  }
  search = () => {
    const here = this;
    api
      .search(this.state.lat, this.state.lng, this.state.radius)
      .then(function(response) {
        here.setState({ sessions: response.data, status: "" });
      })
      .catch(function(error) {
        here.setState({ status: "Error" });
      });
  };
  default = () => {};
  toggle = () => {
    this.setState({ expanded: !this.state.expanded });
  };
  change = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    return (
      <div>
        <SearchWidget
          expanded={this.state.expanded}
          search={this.search}
          default={this.default}
          change={this.change}
          toggle={this.toggle}
          lat={this.state.lat}
          lng={this.state.lng}
          radius={this.state.radius}
        />
        <MyMapContainer
          lng={this.state.lng}
          lat={this.state.lat}
          sessions={this.state.sessions}
          radius={this.state.radius}
        />
      </div>
    );
  }
}

export default App;
