import React, { Component } from "react";

class SearchWidget extends Component {
  render() {
    return <div className="container wrapper">
        <div className="content">
          <div className="spread">
            <div>
              <h1>Shock Tracker</h1>
            </div>

            <div>
              <button onClick={this.props.toggle} className="button bottom-margin">
                {this.props.expanded ? "-" : "+"}
              </button>
            </div>
          </div>
          {this.props.expanded ? <div className="form-block">
                <div className="field field-width">
                  <div className="control">
                    <input className="input" type="number" placeholder="Latitude" value={this.props.lat} onChange={this.props.change} name="lat" />
                  </div>
                </div>

                <div className="field field-width">
                  <div className="control">
                    <input className="input" type="number" placeholder="Longitude" value={this.props.lng} onChange={this.props.change} name="lng" />
                  </div>
                </div>

                <div className="field field-width">
                  <div className="control">
                    <input className="input" type="number" placeholder="Radius" value={this.props.radius} onChange={this.props.change} name="radius" />
                  </div>
                </div>
                <div className="spread">
                  <div className="control">
                    <label className="radio">
                      <input type="radio" name="speed" onClick={this.props.changeState} value="acceleration" checked={this.props.checked === "acceleration"}/>
                      Acceleration
                    </label>
                    <label className="radio">
                      <input type="radio" name="speed" onClick={this.props.changeState} value="speed" checked={this.props.checked === "speed"}/>
                      Speed
                    </label>
                  </div>
                  <div className="control">
                    <button onClick={this.props.search} className="button is-link">
                      Submit
                    </button>
                  </div>
                </div>
              </div> : null}
        </div>
      </div>;
  }
}

export default SearchWidget;
