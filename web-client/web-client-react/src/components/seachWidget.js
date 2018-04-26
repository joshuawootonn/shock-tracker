import React, { Component } from "react";

class SearchWidget extends Component {
  render() {
    const form = " asdf";

    return (
      <div className="container wrapper">
        <div className="content">
          <div class="spread">
            <div>
              <h1>Shock Tracker</h1>
            </div>

            <div>
              <button onClick={this.props.toggle} class="button bottom-margin">
                {this.props.expanded ? "-" : "+"}
              </button>
            </div>
          </div>
          {this.props.expanded
            ? <div className="form-block">
                <div class="field field-width">
                  <div class="control">
                    <input class="input" type="number" placeholder="Latitude" />
                  </div>
                </div>

                <div class="field field-width">
                  <div class="control">
                    <input
                      class="input"
                      type="number"
                      placeholder="Longitude"
                    />
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
            : null}
        </div>
      </div>
    );
  }
}

export default SearchWidget;
