import React from "react";
import logo from "../../imgs/logo.png";
import SearchBar from "../SearchBar/SearchBar";

class Banner extends React.Component {
  state = {
    hideSearchField: true,
  };
  render() {
      return (
        <div className="banner text-white">
          <div className="container p-4 text-center">
            <img src={logo} alt="banner" />
            <div>
              <span>A place to</span>
                <span
                  id="get-part"
                  onClick={(_) => {
                    this.setState({ hideSearchField: false });
                  }}
                >
                  {" "}
                  get{" "}
                </span>
              <span hidden={this.state.hideSearchField} >
              <SearchBar />
              </span>
              <span> the cool stuff.</span>
            </div>
          </div>
        </div>
      );
    }
  }
export default Banner;

