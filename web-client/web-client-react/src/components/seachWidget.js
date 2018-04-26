import React, { Component } from "react";

class SearchWidget extends Component {
  render() {
    return (
      <div className="container wrapper">
        <h1 className="title center-text">Shock Tracker</h1>
        <div class="field field-width">
          <div class="control">
            <input class="input" type="number" placeholder="Latitude" />
          </div>
        </div>

        <div class="field field-width">
          <div class="control">
            <input class="input" type="number" placeholder="Longitude" />
          </div>
        </div>

        <div class="field field-width">
          <div class="control">
            <input class="input" type="number" placeholder="Radius" />
          </div>
        </div>
        <div class="field field-width is-grouped">
          <div class="control">
            <button onClick={this.props.search} class="button is-link">
              Submit
            </button>
          </div>
          <div class="control">
            <button onClick={this.props.default} class="button is-text">
              My Location
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default SearchWidget;
